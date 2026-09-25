const { activeConnections, registerAbortController, unregisterAbortController } = require('./connectionManager');
const streamQueue = require('./streamQueue');

// Inactivity budget for the upstream SSE body. This is an idle timeout, not a
// total-duration cap: the timer resets on every byte received, so a long answer
// streams fine while a genuinely stalled upstream fails fast with a clear error.
// Kept below undici's 300s default bodyTimeout so we control the failure mode
// (undici's would surface as an opaque `TypeError: terminated`).
const UPSTREAM_IDLE_TIMEOUT_MS = Number(process.env.LLM_STREAM_IDLE_TIMEOUT_MS || 120_000);

const ORCHESTRATOR_URL = process.env.LLM_ORCHESTRATOR_URL || 'http://llm-orchestration-service:8100';

// Marks queued requests from the LLM Module GUI, so that sseUtil replays them
// here rather than through the Chat Widget LLM or Azure stream paths, which
// share the same stream queue.
const LLM_GUI_QUEUE_SOURCE = 'llm-gui';

/**
 * Translate one SSE `data:` line into a message for the browser.
 * @returns {boolean} true if this line ended the stream
 */
function relaySSELine({ line, channelId, sender }) {
  if (!line.trim()) return false;
  if (!line.startsWith('data: ')) return false; // ignores `: ping` heartbeats

  try {
    const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
    const content = data.payload?.content;
    const buttons = data.payload?.buttons;

    if (!content) return false;

    if (content === 'END') {
      sender({
        type: 'stream_end',
        streamId: channelId,
        channelId,
        isComplete: true,
      });
      return true;
    }

    // Regular token - send to client (include buttons when present)
    const chunkMessage = {
      type: 'stream_chunk',
      content: content,
      streamId: channelId,
      channelId,
      isComplete: false,
    };
    if (buttons && buttons.length > 0) {
      chunkMessage.buttons = buttons;
    }
    sender(chunkMessage);
    return false;
  } catch (parseError) {
    console.error(`Failed to parse SSE data for channel ${channelId}:`, parseError, line);
    return false;
  }
}

/**
 * Drain the upstream SSE body, relaying each frame to the browser.
 * Returns once the stream ends, the client disconnects, or END is received.
 * @returns {Promise<boolean>} true if an END frame terminated the stream
 */
async function relayUpstreamBody({ response, connectionId, channelId, sender, onActivity }) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (activeConnections.has(connectionId)) {
    const { done, value } = await reader.read();
    if (done) break;

    onActivity();

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the incomplete line in buffer

    for (const line of lines) {
      // Returning here (rather than `break`) also closes the upstream body —
      // a bare `break` only left the inner loop and kept the connection open.
      if (relaySSELine({ line, channelId, sender })) return true;
    }
  }

  return false;
}

/**
 * Stream LLM orchestration response to connected clients
 * @param {Object} params - Request parameters
 * @param {string} params.channelId - Channel identifier
 * @param {string} params.message - User message
 * @param {Object} params.options - Additional options (authorId, conversationHistory, url)
 */
async function createLLMOrchestrationStreamRequest({ channelId, message, options = {} }) {
  const connections = Array.from(activeConnections.entries()).filter(
    ([_, connData]) => connData.channelId === channelId,
  );

  console.log(`Active connections for channel ${channelId}:`, connections.length);

  if (connections.length === 0) {
    streamQueue.addToQueue(channelId, { message, options, source: LLM_GUI_QUEUE_SOURCE });

    if (streamQueue.shouldRetry({ retryCount: 0 })) {
      throw new Error('No active connections found for this channel - request queued');
    } else {
      throw new Error('No active connections found for this channel');
    }
  }

  console.log(`Streaming LLM orchestration for channel ${channelId} to ${connections.length} connections`);

  try {
    const responsePromises = connections.map(([connectionId, connData]) =>
      streamToConnection({ connectionId, connData, channelId, message, options }),
    );

    await Promise.all(responsePromises);
    return { success: true, message: 'Stream completed' };
  } catch (error) {
    console.error(`Error in createLLMOrchestrationStreamRequest:`, error);
    throw error;
  }
}

/**
 * Run one upstream orchestration stream and relay it to a single SSE connection.
 */
async function streamToConnection({ connectionId, connData, channelId, message, options }) {
  const { sender } = connData;
  const abortController = new AbortController();
  let idleTimer = null;
  let idleTimedOut = false;

  // Idle watchdog: reset on every chunk received. Only fires when the upstream
  // genuinely stops producing, never on a merely long answer.
  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      idleTimedOut = true;
      console.error(`Upstream idle for ${UPSTREAM_IDLE_TIMEOUT_MS}ms on channel ${channelId} - aborting`);
      abortController.abort();
    }, UPSTREAM_IDLE_TIMEOUT_MS);
  };

  try {
    // Construct OrchestrationRequest payload
    const orchestrationPayload = {
      chatId: channelId,
      message: message,
      authorId: options.authorId || `user-${channelId}`,
      conversationHistory: options.conversationHistory || [],
      url: options.url || 'sse-stream-context',
      environment: options.environment || 'production',
      connection_id: options.connection_id,
    };

    console.log(`Calling LLM orchestration stream for channel ${channelId}`);

    // The controller serves two purposes: cancelling the upstream request when
    // the browser disconnects, and enforcing the idle timeout above.
    registerAbortController(connectionId, abortController);
    resetIdleTimer();

    // Call the LLM orchestration streaming endpoint
    const response = await fetch(`${ORCHESTRATOR_URL}/orchestrate/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orchestrationPayload),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`LLM Orchestration API error: ${response.status} ${response.statusText}`);
    }

    if (!activeConnections.has(connectionId)) {
      return;
    }

    // Send stream start notification
    sender({
      type: 'stream_start',
      streamId: channelId,
      channelId,
      isComplete: false,
    });

    const sawEnd = await relayUpstreamBody({
      response,
      connectionId,
      channelId,
      sender,
      onActivity: resetIdleTimer,
    });

    // The body closed without an END frame. The browser has a stream_start and
    // possibly some chunks, but nothing that ends the stream, so it would spin
    // forever. Terminate it explicitly rather than trusting every upstream error
    // path to remember the marker. A client that has already disconnected needs
    // no notification.
    if (!sawEnd && activeConnections.has(connectionId)) {
      console.error(`Upstream body ended without END marker on channel ${channelId} (connection ${connectionId})`);
      sender({
        type: 'stream_error',
        error: 'The response ended unexpectedly. Please try again.',
        streamId: channelId,
        channelId,
        isComplete: true,
      });
    }
  } catch (error) {
    // A client-disconnect abort is expected teardown, not a failure: the browser
    // is gone, there is nobody to notify and nothing to log loudly.
    if (error.name === 'AbortError' && !idleTimedOut) {
      console.log(`Upstream stream cancelled for connection ${connectionId} (client disconnected)`);
      return;
    }

    if (idleTimedOut) {
      // The AbortError here is our own watchdog firing; its stack says nothing
      // useful, so report the actual cause instead.
      console.error(
        `Streaming timed out for connection ${connectionId}: no upstream output ` +
          `for ${UPSTREAM_IDLE_TIMEOUT_MS}ms on channel ${channelId}`,
      );
    } else {
      console.error(`Streaming error for connection ${connectionId}:`, error);
    }

    if (activeConnections.has(connectionId)) {
      sender({
        type: 'stream_error',
        error: idleTimedOut ? 'The response timed out. Please try again.' : error.message,
        streamId: channelId,
        channelId,
        isComplete: true,
      });
    }
  } finally {
    if (idleTimer) clearTimeout(idleTimer);
    unregisterAbortController(connectionId, abortController);
  }
}

module.exports = {
  LLM_GUI_QUEUE_SOURCE,
  createLLMOrchestrationStreamRequest,
};
