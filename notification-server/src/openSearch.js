const { Client } = require('@opensearch-project/opensearch');
const { v4: uuidv4 } = require('uuid');

const { sendAzureAgenticRequest } = require('./azureAgenticRequest');
const { streamAzureOpenAIResponse } = require('./azureOpenAI');
const {
  extractMessageTextPart,
  formatAgenticCitations,
  mapAnnotationsToCitations,
  createAgenticStreamState,
  consumeAgenticStreamDelta,
  flushAgenticStreamBuffer,
  hasAzureAiSearchTool,
} = require('./citationFormatting');
const { newNotificationsConfig, openSearchConfig } = require('./config');
const { activeConnections, stoppedChannels } = require('./connectionManager');
const streamQueue = require('./streamQueue');

let client = buildClient();

async function publishNotificationEvent(chatId, event) {
  const envelope = {
    eventUuid: uuidv4(),
    recipient: 'CHAT',
    recipientUuid: [chatId],
    type: event.type,
    payload: event,
  };

  const response = await fetch(newNotificationsConfig.eventUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelope),
  });

  if (!response.ok) {
    throw new Error(`New notification event was rejected: ${response.status} ${response.statusText}`);
  }
}

async function streamAgenticResponse({ response, channelId }) {
  const citationState = createAgenticStreamState();
  let finalAnnotations = [];

  for await (const part of response) {
    if (stoppedChannels.has(channelId)) break;

    if (part.type === 'response.output_text.delta') {
      const emitText = consumeAgenticStreamDelta(citationState, part.delta || '');
      if (emitText) {
        await publishNotificationEvent(channelId, {
          type: 'stream_chunk',
          channelId,
          content: emitText,
          isComplete: false,
        });
      }
    } else if (part.type === 'response.completed') {
      const fullResponse = part.response ?? part;
      finalAnnotations = hasAzureAiSearchTool(fullResponse)
        ? extractMessageTextPart(fullResponse)?.annotations || []
        : [];
    }
  }

  if (stoppedChannels.has(channelId)) return;

  const trailingText = flushAgenticStreamBuffer(citationState);
  if (trailingText) {
    await publishNotificationEvent(channelId, {
      type: 'stream_chunk',
      channelId,
      content: trailingText,
      isComplete: false,
    });
  }

  const citations = mapAnnotationsToCitations(finalAnnotations);

  await publishNotificationEvent(channelId, {
    type: 'stream_complete',
    channelId,
    content: '',
    context: citations.length > 0 ? { citations } : {},
    isComplete: true,
  });
}

function isFallbackMessage(text, openAIFallback1, openAIFallback2) {
  return text === openAIFallback1 || text === openAIFallback2;
}

async function fetchLLMResponse({
  use_agentic,
  messages,
  options,
  stream,
  agent_name,
  agent_type,
  azure_client_id,
  azure_client_secret,
  azure_agentic_max_output_tokens,
}) {
  if (use_agentic) {
    return sendAzureAgenticRequest(messages, {
      ...options,
      stream,
      agent_name,
      agent_type,
      client_id: azure_client_id,
      client_secret: azure_client_secret,
      max_output_tokens: azure_agentic_max_output_tokens,
    });
  }
  return streamAzureOpenAIResponse(messages, options);
}

async function sendRawResponse({ response, channelId, stream }) {
  if (!stream) {
    await publishNotificationEvent(channelId, response?.type ? response : { type: 'raw_response', data: response });
    return;
  }

  for await (const part of response) {
    if (stoppedChannels.has(channelId)) break;
    await publishNotificationEvent(channelId, part?.type ? part : { type: 'raw_response', data: part });
  }
}

async function deliverResponse({
  response,
  channelId,
  stream,
  use_agentic,
  openAIFallback1,
  openAIFallback2,
  estonianFallback,
}) {
  if (!stream) {
    const { content, context } = buildCompleteResponseContent({
      response,
      use_agentic,
      openAIFallback1,
      openAIFallback2,
      estonianFallback,
    });
    await publishNotificationEvent(channelId, { type: 'complete_response', channelId, content, context, isComplete: true });
    return;
  }

  await publishNotificationEvent(channelId, { type: 'stream_start', streamId: channelId, channelId });

  if (use_agentic) {
    await streamAgenticResponse({ response, channelId });
  } else {
    await streamClassicResponse({
      response,
      channelId,
      openAIFallback1,
      openAIFallback2,
      estonianFallback,
    });
  }
}

function buildCompleteResponseContent({ response, use_agentic, openAIFallback1, openAIFallback2, estonianFallback }) {
  if (use_agentic) {
    const textPart = extractMessageTextPart(response);
    const annotations = hasAzureAiSearchTool(response) ? textPart?.annotations : [];
    return formatAgenticCitations(textPart?.text, annotations);
  }

  const content = response.choices?.[0]?.message?.content || '';
  const context = response.choices?.[0]?.message?.context || {};
  const trimmed = content.trim();

  return {
    content: isFallbackMessage(trimmed, openAIFallback1, openAIFallback2) ? estonianFallback : content,
    context,
  };
}

function isFallbackPrefix(text, openAIFallback1, openAIFallback2) {
  return openAIFallback1.startsWith(text) || openAIFallback2.startsWith(text);
}

function processClassicDelta(state, part, openAIFallback1, openAIFallback2) {
  const choice = part.choices?.[0];
  if (!choice) return null;

  if (!state.context && choice.delta?.context) state.context = choice.delta.context;
  const content = choice.delta?.content || '';
  if (!content) return null;

  state.cumulative += content;

  if (state.startedStreaming) return content;

  if (isFallbackPrefix(state.cumulative, openAIFallback1, openAIFallback2)) return null;

  state.startedStreaming = true;
  return state.cumulative;
}

async function streamClassicResponse({
  response,
  channelId,
  openAIFallback1,
  openAIFallback2,
  estonianFallback,
}) {
  const state = { context: undefined, cumulative: '', startedStreaming: false };

  for await (const part of response) {
    if (stoppedChannels.has(channelId)) break;

    const emitText = processClassicDelta(state, part, openAIFallback1, openAIFallback2);
    if (emitText) {
      await publishNotificationEvent(channelId, {
        type: 'stream_chunk',
        channelId,
        content: emitText,
        isComplete: false,
      });
    }
  }

  if (stoppedChannels.has(channelId)) return;

  if (!state.startedStreaming && isFallbackMessage(state.cumulative.trim(), openAIFallback1, openAIFallback2)) {
    await publishNotificationEvent(channelId, {
      type: 'stream_chunk',
      channelId,
      content: estonianFallback,
      isComplete: false,
    });
  }

  await publishNotificationEvent(channelId, {
    type: 'stream_complete',
    channelId,
    content: '',
    context: state.context || {},
    isComplete: true,
  });
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

async function createAzureOpenAIStreamRequest({
  channelId,
  messages,
  options = {},
  use_agentic = false,
  agent_name,
  agent_type,
  azure_client_id,
  azure_client_secret,
  azure_agentic_max_output_tokens,
  raw_response = false,
}) {
  const { stream = true } = options;

  try {
    stoppedChannels.delete(channelId);
    const response = await fetchLLMResponse({
      use_agentic,
      messages,
      options,
      stream,
      agent_name,
      agent_type,
      azure_client_id,
      azure_client_secret,
      azure_agentic_max_output_tokens,
    });

    if (raw_response) {
      await sendRawResponse({ response, channelId, stream });
      return;
    }
    const openAIFallback1 =
      'The requested information is not found in the retrieved data. Please try another query or topic.';
    const openAIFallback2 =
      'The requested information is not available in the retrieved data. Please try another query or topic.';
    const estonianFallback =
      'Mulle kättesaadavates andmetes puudub teie küsimusele vastav info. Palun täpsustage oma küsimust.';

    await deliverResponse({
      response,
      channelId,
      stream,
      use_agentic,
      openAIFallback1,
      openAIFallback2,
      estonianFallback,
    });


    return {
      success: true,
      channelId,
      message: `Azure OpenAI ${stream ? 'streaming' : 'response'} published`,
    };
  } catch (error) {
    const errorMessage = `Failed to ${stream ? 'stream' : 'generate'} response`;
    try {
      await publishNotificationEvent(channelId, {
        type: stream ? 'stream_error' : 'response_error',
        channelId,
        content: errorMessage,
        isComplete: true,
      });
    } catch (publishError) {
      console.error('Failed to publish LLM error event:', publishError);
    }
    console.error(`Error in createAzureOpenAIStreamRequest (stream=${stream}):`, error);
    throw error;
  }
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

  await Promise.all(
    connections.map(([connectionId, connData]) =>
      handleLLMConnection(connectionId, connData, orchestrationPayload, channelId),
    ),
  );
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

async function readLLMStream(reader, decoder, sender, channelId, connectionId) {
  let buffer = '';
  while (activeConnections.has(connectionId)) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (processSSELine(line, sender, channelId)) return;
    }
  }
}

async function handleLLMConnection(connectionId, connData, orchestrationPayload, channelId) {
  const { sender } = connData;
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
    await readLLMStream(response.body.getReader(), new TextDecoder(), sender, channelId, connectionId);
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
  createAzureOpenAIStreamRequest,
  createLLMOrchestrationStreamRequest,
};
