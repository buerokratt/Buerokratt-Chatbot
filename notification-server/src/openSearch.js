const { Client } = require("@opensearch-project/opensearch");
const { openSearchConfig } = require("./config");
const { streamAzureOpenAIResponse } = require("./azureOpenAI");

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
          sort: { timestamp: { order: "asc" } },
        },
      })
      .catch(handleError);

    for (const hit of response.body.hits.hits) {
      const notification = hit._source;

      if (notification.type === "azure_openai_stream") {
        await handleAzureOpenAIStream(notification, sender, connectionId);
      } else {
        await sender(notification.payload);
      }

      await markAsSent(hit, connectionId);
    }
  } catch (e) {
    console.error(e);
    await sender({ error: "Notification processing failed" });
  }
}

async function handleAzureOpenAIStream(notification, sender, connectionId) {
  const { messages, options, streamId } = notification.payload;

  try {
    const response = await streamAzureOpenAIResponse(messages, options);

    sender({
      type: "stream_start",
      streamId,
      channelId: notification.channelId,
    });

    for await (const part of response) {
      const content = part.choices[0]?.delta?.content;
      if (content) {
        sender({
          type: "stream_chunk",
          streamId,
          content: content,
          isComplete: false,
        });
      }
    }

    sender({
      type: "stream_complete",
      streamId,
      content: "",
      isComplete: true,
    });
    await cleanupCompletedStreams(notification._id);
  } catch (error) {
    console.error("Azure OpenAI streaming error:", error);
    sender({
      type: "stream_error",
      streamId,
      content: "Failed to stream response",
      isComplete: true,
    });
    await cleanupCompletedStreams(notification._id);
  }
}

async function createAzureOpenAIStreamRequest({ channelId, messages, options = {} }) {
  const notificationId = uuidv4();

  await client
    .index({
      index: openSearchConfig.notificationIndex,
      id: notificationId,
      body: {
        channelId,
        type: "azure_openai_stream",
        payload: {
          messages,
          options,
          streamId: notificationId,
        },
        timestamp: Date.now(),
        sentTo: [],
      },
      refresh: true,
    })
    .catch(handleError);

  return notificationId;
}


async function cleanupCompletedStreams(streamId) {
  await client
    .delete({
      index: openSearchConfig.notificationIndex,
      id: streamId,
    })
    .catch(handleError);
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
        lang: "painless",
        params: { connectionId },
      },
    },
  });
}

async function enqueueChatId(chatId) {
  if (await findChatId(chatId)) return;

  await client.index({
    index: openSearchConfig.chatQueueIndex,
    body: {
      chatId,
      timestamp: Date.now(),
    },
    refresh: true,
  }).catch(handleError);
}

async function dequeueChatId(chatId) {
  await client.deleteByQuery({
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
    conflicts: "proceed",
  }).catch(handleError);
}

async function findChatId(chatId) {
  const found = await isQueueIndexExists();
  if (!found) return null;

  const response = await client.search({
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
  }).catch(handleError);

  if (response.body.hits.hits.length == 0) return null;

  return response.body.hits.hits[0]._source;
}

async function isQueueIndexExists() {
  const res = await client.indices.exists({
    index: openSearchConfig.chatQueueIndex,
  }).catch(handleError);
  return res.body;
}

async function findChatIdOrder(chatId) {
  const found = await findChatId(chatId);
  if (!found) return 0;

  const response = await client.search({
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
  }).catch(handleError);

  return response.body.hits.total.value + 1;
}

function buildClient() {
  return new Client({
    node: openSearchConfig.getUrl(),
    ssl: openSearchConfig.ssl,
  });
}

function handleError(e) {
  if(e.name === 'ConnectionError')
    client = buildClient();
  throw e;
}

module.exports = {
  searchNotification,
  enqueueChatId,
  dequeueChatId,
  findChatIdOrder,
  sendBulkNotification,
  createAzureOpenAIStreamRequest,
};
