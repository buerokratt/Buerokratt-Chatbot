const { Client } = require('@opensearch-project/opensearch');

const { sendAzureAgenticRequest } = require('./azureAgenticRequest');
const {
  extractMessageTextPart,
  formatAgenticCitations,
  mapAnnotationsToCitations,
  createAgenticStreamState,
  consumeAgenticStreamDelta,
  flushAgenticStreamBuffer,
  hasAzureAiSearchTool,
} = require('./citationFormatting');
const { openSearchConfig } = require('./config');
const { activeConnections, stoppedChannels, currentStreams } = require('./connectionManager');
const streamQueue = require('./streamQueue');

let client = buildClient();

const AGENTIC_GUARDRAIL_MESSAGE = "I'm sorry, but i cannot assist with that request.";
const ESTONIAN_GUARDRAIL_MESSAGE = 'Palun vabandust, aga kahjuks ei saa ma sellele päringule vastata.';

function isGuardrailMessage(text) {
  return text.trim().toLowerCase() === AGENTIC_GUARDRAIL_MESSAGE.toLowerCase();
}

// Holds the start of a streamed answer until it is clear it is not the guardrail message
function holdGuardrailText(held, text) {
  if (!held.isHolding || !text) return text;
  held.text += text;
  if (AGENTIC_GUARDRAIL_MESSAGE.toLowerCase().startsWith(held.text.trim().toLowerCase())) return '';
  held.isHolding = false;
  return held.text;
}

function releaseHeldText(held) {
  if (!held.isHolding) return '';
  return isGuardrailMessage(held.text) ? ESTONIAN_GUARDRAIL_MESSAGE : held.text;
}

async function streamAgenticResponse({ response, connectionId, channelId, sender }) {
  const citationState = createAgenticStreamState();
  const held = { text: '', isHolding: true };
  let finalAnnotations = [];

  for await (const part of response) {
    if (!activeConnections.has(connectionId) || stoppedChannels.has(channelId)) break;

    if (part.type === 'response.output_text.delta') {
      const emitText = holdGuardrailText(held, consumeAgenticStreamDelta(citationState, part.delta || ''));
      if (emitText) {
        sender({ type: 'stream_chunk', channelId, content: emitText, isComplete: false });
      }
    } else if (part.type === 'response.completed') {
      const fullResponse = part.response ?? part;
      finalAnnotations = hasAzureAiSearchTool(fullResponse)
        ? extractMessageTextPart(fullResponse)?.annotations || []
        : [];
    }
  }

  if (!activeConnections.has(connectionId) || stoppedChannels.has(channelId)) return;

  const trailingText = releaseHeldText(held) + flushAgenticStreamBuffer(citationState);
  if (trailingText) {
    sender({ type: 'stream_chunk', channelId, content: trailingText, isComplete: false });
  }

  const citations = mapAnnotationsToCitations(finalAnnotations);

  sender({
    type: 'stream_complete',
    channelId,
    content: '',
    context: citations.length > 0 ? { citations } : {},
    isComplete: true,
  });
}

async function fetchAgenticResponse({
  messages,
  options,
  stream,
  agent_name,
  agent_type,
  azure_client_id,
  azure_client_secret,
  azure_agentic_max_output_tokens,
  structured_inputs,
}) {
  return sendAzureAgenticRequest(messages, {
    ...options,
    stream,
    agent_name,
    agent_type,
    client_id: azure_client_id,
    client_secret: azure_client_secret,
    max_output_tokens: azure_agentic_max_output_tokens,
    structured_inputs,
  }).catch((error) => {
    if (stream || !error.message?.includes('"code":"content_filter"')) throw error;
    return { output: [{ type: 'message', content: [{ type: 'output_text', text: ESTONIAN_GUARDRAIL_MESSAGE }] }] };
  });
}

async function sendRawResponse({ response, connectionId, channelId, sender, stream }) {
  if (!stream) {
    sender(response);
    return;
  }

  for await (const part of response) {
    if (!activeConnections.has(connectionId) || stoppedChannels.has(channelId)) break;
    sender(part);
  }
}

async function deliverResponse({ response, connectionId, channelId, sender, stream }) {
  if (!stream) {
    const { content, context } = buildCompleteResponseContent(response);
    sender({ type: 'complete_response', channelId, content, context, isComplete: true });
    return;
  }

  sender({ type: 'stream_start', streamId: channelId, channelId });
  await streamAgenticResponse({ response, connectionId, channelId, sender });
}

function buildCompleteResponseContent(response) {
  const textPart = extractMessageTextPart(response);
  const annotations = hasAzureAiSearchTool(response) ? textPart?.annotations : [];
  const { content, context } = formatAgenticCitations(textPart?.text, annotations);
  return { content: isGuardrailMessage(content) ? ESTONIAN_GUARDRAIL_MESSAGE : content, context };
}

async function searchNotification({ channelId, connectionId, sender }) {
  try {
    const response = await client
      .search({
        index: openSearchConfig.notificationIndex,
        body: {
          query: {
            bool: {
              must: { match: { channelId } },
              must_not: { match: { sentTo: connectionId } },
            },
          },
          sort: { timestamp: { order: 'asc' } },
        },
      })
      .catch(handleError);

    for (const hit of response.body.hits.hits) {
      const notification = hit._source;

      await sender(notification.payload);

      await markAsSent(hit, connectionId);
    }
  } catch (e) {
    console.error('processing notification error:', e);
    await sender({ error: 'Notification processing failed' });
  }
}

async function createAgenticStreamRequest({
  channelId,
  messages,
  options = {},
  agent_name,
  agent_type,
  azure_client_id,
  azure_client_secret,
  azure_agentic_max_output_tokens,
  structured_inputs,
  raw_response = false,
}) {
  const { stream = true } = options;
  const streamToken = {};
  currentStreams.set(channelId, streamToken);

  try {
    stoppedChannels.delete(channelId);

    const connections = Array.from(activeConnections.entries()).filter(
      ([_, connData]) => connData.channelId === channelId,
    );

    if (connections.length === 0) {
      const requestId = streamQueue.addToQueue(channelId, {
        messages,
        options,
        agent_name,
        agent_type,
        azure_client_id,
        azure_client_secret,
        azure_agentic_max_output_tokens,
        structured_inputs,
        raw_response,
      });
      console.log('No active connections for channel, queued request');
    }

    const responsePromises = connections.map(async ([connectionId, connData]) => {
      const sender = (data) => {
        if (currentStreams.get(channelId) === streamToken) connData.sender(data);
      };

      try {
        const response = await fetchAgenticResponse({
          messages,
          options,
          stream,
          agent_name,
          agent_type,
          azure_client_id,
          azure_client_secret,
          azure_agentic_max_output_tokens,
          structured_inputs,
        });

        if (!activeConnections.has(connectionId)) {
          return;
        }

        if (raw_response) {
          await sendRawResponse({ response, connectionId, channelId, sender, stream });
          return;
        }

        await deliverResponse({ response, connectionId, channelId, sender, stream });
      } catch (error) {
        if (activeConnections.has(connectionId)) {
          const errorMessage = `Failed to ${stream ? 'stream' : 'generate'} response: ${error.message}`;
          sender({
            type: stream ? 'stream_error' : 'response_error',
            channelId,
            content: errorMessage,
            isComplete: true,
          });
        }
        throw error;
      }
    });

    await Promise.all(responsePromises);

    return {
      success: true,
      channelId,
      connectionsCount: connections.length,
      message: `Agentic ${stream ? 'streaming' : 'response'} completed for all connections`,
    };
  } catch (error) {
    console.error(`Error in createAgenticStreamRequest (stream=${stream}):`, error);
    throw error;
  } finally {
    if (currentStreams.get(channelId) === streamToken) currentStreams.delete(channelId);
  }
}

async function sendBulkNotification({ operations }) {
  await client.bulk({ body: operations });
}

async function markAsSent({ _index, _id }, connectionId) {
  await client.update({
    index: _index,
    id: _id,
    retry_on_conflict: openSearchConfig.retry_on_conflict,
    body: {
      script: {
        source: `if (ctx._source.sentTo == null) {
          ctx._source.sentTo = [params.connectionId];
        } else {
          ctx._source.sentTo.add(params.connectionId);
        }`,
        lang: 'painless',
        params: { connectionId },
      },
    },
  });
}

async function enqueueChatId(chatId) {
  if (await findChatId(chatId)) return;

  await client
    .index({
      index: openSearchConfig.chatQueueIndex,
      body: {
        chatId,
        timestamp: Date.now(),
      },
      refresh: true,
    })
    .catch(handleError);
}

async function dequeueChatId(chatId) {
  await client
    .deleteByQuery({
      index: openSearchConfig.chatQueueIndex,
      body: {
        query: {
          match: {
            chatId: {
              query: chatId,
            },
          },
        },
      },
      refresh: true,
      conflicts: 'proceed',
    })
    .catch(handleError);
}

async function findChatId(chatId) {
  const found = await isQueueIndexExists();
  if (!found) return null;

  const response = await client
    .search({
      index: openSearchConfig.chatQueueIndex,
      body: {
        query: {
          match: {
            chatId: {
              query: chatId,
            },
          },
        },
      },
    })
    .catch(handleError);

  if (response.body.hits.hits.length == 0) return null;

  return response.body.hits.hits[0]._source;
}

async function isQueueIndexExists() {
  const res = await client.indices
    .exists({
      index: openSearchConfig.chatQueueIndex,
    })
    .catch(handleError);
  return res.body;
}

async function findChatIdOrder(chatId) {
  const found = await findChatId(chatId);
  if (!found) return 0;

  const response = await client
    .search({
      index: openSearchConfig.chatQueueIndex,
      body: {
        query: {
          range: {
            timestamp: {
              lt: found.timestamp,
            },
          },
        },
        size: 0,
      },
    })
    .catch(handleError);

  return response.body.hits.total.value + 1;
}

function buildClient() {
  return new Client({
    node: openSearchConfig.getUrl(),
    ssl: openSearchConfig.ssl,
  });
}

function handleError(e) {
  if (e.name === 'ConnectionError') client = buildClient();
  throw e;
}

async function createLLMOrchestrationStreamRequest({ channelId, chatId, message, authorId, conversationHistory = [] }) {
  const connections = Array.from(activeConnections.entries()).filter(
    ([_, connData]) => connData.channelId === channelId,
  );

  console.log('Active connections for LLM stream channel:', connections.length);

  if (connections.length === 0) {
    streamQueue.addToQueue(channelId, { chatId: chatId || channelId, message, authorId, conversationHistory });
    console.log('No active connections for channel, queued LLM request');
    return;
  }

  const orchestrationPayload = {
    chatId: chatId || channelId,
    message,
    authorId: authorId || `user-${channelId}`,
    conversationHistory: buildConversationHistory(conversationHistory),
    url: 'sse-stream-context',
  };

  const streamToken = {};
  currentStreams.set(channelId, streamToken);

  try {
    await Promise.all(
      connections.map(([connectionId, connData]) =>
        handleLLMConnection(connectionId, connData, orchestrationPayload, channelId, streamToken),
      ),
    );
  } finally {
    if (currentStreams.get(channelId) === streamToken) currentStreams.delete(channelId);
  }
  return { success: true, channelId };
}

function buildConversationHistory(conversationHistory) {
  return (conversationHistory || []).map((m) => {
    const rawRole = m.authorRole || m.role || 'user';
    const authorRole = rawRole === 'assistant' ? 'bot' : rawRole;
    return {
      authorRole,
      message: m.message || m.content,
      timestamp: m.timestamp || new Date().toISOString(),
    };
  });
}

function processSSELine(line, sender, channelId) {
  if (!line.trim() || !line.startsWith('data: ')) return false;
  try {
    const data = JSON.parse(line.slice(6));
    const content = data.payload?.content;
    if (!content) return false;
    if (content === 'END') {
      sender({ type: 'stream_complete', streamId: channelId, channelId, isComplete: true });
      return true;
    }
    sender({ type: 'stream_chunk', content, streamId: channelId, channelId, isComplete: false });
  } catch (parseError) {
    console.error('Failed to parse LLM SSE data:', parseError, line);
  }
  return false;
}

async function readLLMStream(reader, decoder, sender, channelId, connectionId, streamToken) {
  let buffer = '';
  while (activeConnections.has(connectionId) && currentStreams.get(channelId) === streamToken) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (processSSELine(line, sender, channelId)) return;
    }
  }
  await reader.cancel();
}

async function handleLLMConnection(connectionId, connData, orchestrationPayload, channelId, streamToken) {
  const sender = (data) => {
    if (currentStreams.get(channelId) === streamToken) connData.sender(data);
  };
  try {
    const response = await fetch(
      `${process.env.LLM_ORCHESTRATOR_URL || 'http://llm-orchestration-service:8100'}/orchestrate/stream`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orchestrationPayload),
      },
    );
    if (!response.ok) {
      throw new Error(`LLM Orchestration API error: ${response.status} ${response.statusText}`);
    }
    if (!activeConnections.has(connectionId)) return;
    sender({ type: 'stream_start', streamId: channelId, channelId, isComplete: false });
    await readLLMStream(response.body.getReader(), new TextDecoder(), sender, channelId, connectionId, streamToken);
  } catch (error) {
    console.error(`LLM streaming error for connection ${connectionId}:`, error);
    if (activeConnections.has(connectionId)) {
      sender({ type: 'stream_error', error: error.message, streamId: channelId, channelId, isComplete: true });
    }
  }
}

module.exports = {
  client,
  searchNotification,
  enqueueChatId,
  dequeueChatId,
  findChatIdOrder,
  sendBulkNotification,
  createAgenticStreamRequest,
  createLLMOrchestrationStreamRequest,
};
