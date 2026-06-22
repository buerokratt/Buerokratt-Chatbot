const { Client } = require('@opensearch-project/opensearch');

const { sendAzureAgenticRequest } = require('./azureAgenticRequest');
const { streamAzureOpenAIResponse } = require('./azureOpenAI');
const { openSearchConfig } = require('./config');
const { activeConnections, stoppedChannels } = require('./connectionManager');
const streamQueue = require('./streamQueue');

let client = buildClient();

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
}) {
  const { stream = true } = options;

  try {
    stoppedChannels.delete(channelId);

    const connections = Array.from(activeConnections.entries()).filter(
      ([_, connData]) => connData.channelId === channelId,
    );

    if (connections.length === 0) {
      const requestId = streamQueue.addToQueue(channelId, { messages, options, use_agentic, agent_name, agent_type });
      console.log('No active connections for channel, queued request');
    }

    const responsePromises = connections.map(async ([connectionId, connData]) => {
      const { sender } = connData;

      try {
        let response;

        if (use_agentic) {
          response = await sendAzureAgenticRequest(messages, {
            ...options,
            stream,
            agent_name,
            agent_type,
          });
        } else {
          response = await streamAzureOpenAIResponse(messages, options);
        }

        if (!activeConnections.has(connectionId)) {
          return;
        }

        const openAIFallback1 =
          'The requested information is not found in the retrieved data. Please try another query or topic.';
        const openAIFallback2 =
          'The requested information is not available in the retrieved data. Please try another query or topic.';
        const estonianFallback =
          'Mulle kättesaadavates andmetes puudub teie küsimusele vastav info. Palun täpsustage oma küsimust.';

        if (stream) {
          sender({
            type: 'stream_start',
            streamId: channelId,
            channelId,
          });

          let context;
          let cumulative = '';
          let startedStreaming = false;

          for await (const part of response) {
            if (!activeConnections.has(connectionId) || stoppedChannels.has(channelId)) break;

            let content = '';

            if (use_agentic) {
              if (part.type === 'response.output_text.delta') {
                content = part.delta || '';
              }
            } else {
              const choice = part.choices?.[0];
              if (!choice) continue;
              if (!context && choice.delta?.context) context = choice.delta.context;
              content = choice.delta?.content || '';
            }

            if (!content) continue;

            if (use_agentic) {
              if (!startedStreaming) {
                startedStreaming = true;
              }
              sender({
                type: 'stream_chunk',
                channelId,
                content,
                isComplete: false,
              });
            } else {
              cumulative += content;

              if (startedStreaming) {
                sender({
                  type: 'stream_chunk',
                  channelId,
                  content,
                  isComplete: false,
                });
              } else {
                const isPrefixOfT1 = openAIFallback1.startsWith(cumulative);
                const isPrefixOfT2 = openAIFallback2.startsWith(cumulative);

                if (isPrefixOfT1 || isPrefixOfT2) continue;

                startedStreaming = true;

                sender({
                  type: 'stream_chunk',
                  channelId,
                  content: cumulative,
                  isComplete: false,
                });
              }
            }
          }

          if (activeConnections.has(connectionId) && !stoppedChannels.has(channelId)) {
            if (!startedStreaming) {
              const trimmed = cumulative.trim();
              if (trimmed === openAIFallback1 || trimmed === openAIFallback2) {
                sender({
                  type: 'stream_chunk',
                  channelId,
                  content: estonianFallback,
                  isComplete: false,
                });
              }
            }

            sender({
              type: 'stream_complete',
              channelId,
              content: '',
              context: context || {},
              isComplete: true,
            });
          }
        } else {
          let content = '';
          let context = {};

          if (use_agentic) {
            const messageOutput = response.output?.find((item) => item.type === 'message');
            content = messageOutput?.content?.[0]?.text || '';
          } else {
            content = response.choices?.[0]?.message?.content || '';
            context = response.choices?.[0]?.message?.context || {};
          }

          const trimmed = content.trim();
          const isDefaultMessage = trimmed === openAIFallback1 || trimmed === openAIFallback2;

          if (isDefaultMessage && !use_agentic) content = estonianFallback;

          sender({
            type: 'complete_response',
            channelId,
            content: content,
            context,
            isComplete: true,
          });
        }
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
      message: `Azure OpenAI ${stream ? 'streaming' : 'response'} completed for all connections`,
    };
  } catch (error) {
    console.error(`Error in createAzureOpenAIStreamRequest (stream=${stream}):`, error);
    throw error;
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

  await Promise.all(
    connections.map(([connectionId, connData]) =>
      handleLLMConnection(connectionId, connData, orchestrationPayload, channelId),
    ),
  );
  return { success: true, channelId };
}

function buildConversationHistory(conversationHistory) {
  return (conversationHistory || []).map(m => {
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
  findChatIdOrder,
  sendBulkNotification,
  createAzureOpenAIStreamRequest,
  createLLMOrchestrationStreamRequest,
};
