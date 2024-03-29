const { Client } = require("@opensearch-project/opensearch");
const { openSearchConfig } = require("./config");

const client = new Client({
  node: openSearchConfig.getUrl(),
  ssl: openSearchConfig.ssl,
});

async function searchNotification({ channelId, connectionId, sender }) {
  try {
    const response = await client.search({
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
    });

    for (const hit of response.body.hits.hits) {
      await sender(hit._source.payload);
      await markAsSent(hit, connectionId);
    }
  } catch (e) {
    console.error(e);
    await sender({});
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
  });
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
  });
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
  });

  if (response.body.hits.hits.length == 0) return null;

  return response.body.hits.hits[0]._source;
}

async function isQueueIndexExists() {
  const res = await client.indices.exists({
    index: openSearchConfig.chatQueueIndex,
  });

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
  });

  return response.body.hits.total.value + 1;
}

module.exports = {
  searchNotification,
  enqueueChatId,
  dequeueChatId,
  findChatIdOrder,
};
