const { v4: uuidv4 } = require('uuid');

const { activeConnections, abortConnectionRequests } = require('./connectionManager');
const { createAzureOpenAIStreamRequest } = require('./openSearch');
const {
  LLM_GUI_QUEUE_SOURCE,
  createLLMOrchestrationStreamRequest: createLLMGuiStreamRequest,
} = require('./streamingService');
const streamQueue = require('./streamQueue');

// Comment frames are written this often so that every intermediate proxy sees
// traffic and does not close the connection on its idle timer. EventSource
// ignores comment frames, so this is invisible to the browser.
const HEARTBEAT_INTERVAL_MS = Number(process.env.SSE_HEARTBEAT_INTERVAL_MS || 15_000);

function buildSSEResponse({ res, req, buildCallbackFunction, channelId, llmStream = false }) {
  addSSEHeader(req, res, llmStream);
  keepStreamAlive(res);
  // Only LLM Module GUI connections get the heartbeat; the other SSE routes are unchanged.
  const heartbeat = llmStream ? startHeartbeat(res) : null;
  const connectionId = generateConnectionID();
  const sender = buildSender(res);

  activeConnections.set(connectionId, {
    res,
    sender,
    channelId,
    abortControllers: new Set(),
  });

  if (channelId) {
    setTimeout(() => {
      processPendingStreamsForChannel(channelId);
    }, 1000);
  }

  const cleanUp = buildCallbackFunction({ connectionId, sender });

  req.on('close', () => {
    console.log(`Client disconnected from SSE for channel ${channelId}`);
    clearInterval(heartbeat);
    // Cancel any in-flight upstream generation - nobody is left to read it.
    abortConnectionRequests(connectionId);
    activeConnections.delete(connectionId);
    cleanUp?.();
  });
}

function addSSEHeader(req, res, llmStream) {
  const origin = extractOrigin(req.headers.origin);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    // Stops nginx-style proxies buffering the stream into a single response.
    ...(llmStream && { 'X-Accel-Buffering': 'no' }),
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Expose-Headers': 'Origin, X-Requested-With, Content-Type, Cache-Control, Connection, Accept',
  });
}

function extractOrigin(reqOrigin) {
  const corsWhitelist = process.env.CORS_WHITELIST_ORIGINS.split(',');
  const whitelisted = corsWhitelist.indexOf(reqOrigin) !== -1;
  return whitelisted ? reqOrigin : '*';
}

function keepStreamAlive(res) {
  res.write('');
}

/**
 * Keep the SSE connection warm with periodic comment frames, so proxies between
 * the browser and this server do not time it out during a long generation pause.
 * @returns {NodeJS.Timeout} interval handle; the caller must clear it on close.
 */
function startHeartbeat(res) {
  const heartbeat = setInterval(() => {
    try {
      // A `:` line is an SSE comment: ignored by EventSource, but it is traffic.
      res.write(': ping\n\n');
      if (typeof res.flush === 'function') {
        res.flush();
      }
    } catch (error) {
      console.error('SSE heartbeat write failed:', error);
      clearInterval(heartbeat);
    }
  }, HEARTBEAT_INTERVAL_MS);

  // Do not hold the event loop open purely for a heartbeat.
  heartbeat.unref?.();
  return heartbeat;
}

function generateConnectionID() {
  const connectionId = uuidv4();
  console.log(`New client connected with connectionId: ${connectionId}`);
  return connectionId;
}

function buildSender(res) {
  return (data) => {
    try {
      const formattedData = typeof data === 'string' ? data : JSON.stringify(data);
      res.write(`data: ${formattedData}\n\n`);
      if (typeof res.flush === 'function') {
        res.flush();
      }
    } catch (error) {
      console.error('SSE write error:', error);
    }
  };
}

function processPendingStreamsForChannel(channelId) {
  const pendingRequests = streamQueue.getPendingRequests(channelId);

  if (pendingRequests.length > 0) {
    pendingRequests.forEach(async (requestData) => {
      if (streamQueue.shouldRetry(requestData)) {
        try {
          if (requestData.source === LLM_GUI_QUEUE_SOURCE) {
            await createLLMGuiStreamRequest({
              channelId,
              message: requestData.message,
              options: requestData.options,
            });
          } else if (requestData.message === undefined) {
            await createAzureOpenAIStreamRequest({
              use_agentic: requestData.use_agentic,
              agent_name: requestData.agent_name,
              agent_type: requestData.agent_type,
              azure_client_id: requestData.azure_client_id,
              azure_client_secret: requestData.azure_client_secret,
              azure_agentic_max_output_tokens: requestData.azure_agentic_max_output_tokens,
              channelId,
              messages: requestData.messages,
              options: requestData.options,
              raw_response: requestData.raw_response,
            });
          } else {
            const { createLLMOrchestrationStreamRequest } = require('./openSearch');
            await createLLMOrchestrationStreamRequest({
              channelId,
              chatId: requestData.chatId || channelId,
              message: requestData.message,
              authorId: requestData.authorId,
              conversationHistory: requestData.conversationHistory,
            });
          }

          streamQueue.removeFromQueue(channelId, requestData.id);
        } catch (error) {
          // Strip line breaks so the request value cannot inject fake log lines
          const logChannelId = channelId.replace(/[\n\r]/g, '');
          console.error(`Failed to process queued stream for channel ${logChannelId}:`, error);
          streamQueue.incrementRetryCount(channelId, requestData.id);
        }
      } else {
        streamQueue.removeFromQueue(channelId, requestData.id);
      }
    });
  }
}

module.exports = {
  activeConnections,
  buildSSEResponse,
  processPendingStreamsForChannel,
};
