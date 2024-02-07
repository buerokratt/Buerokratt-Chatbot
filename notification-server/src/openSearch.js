const { Client } = require("@opensearch-project/opensearch");
const { openSearchConfig } = require("./config");

const client = new Client({
  node: openSearchConfig.getUrl(),
  ssl: openSearchConfig.ssl,
});

async function searchNotification({ channelId, callback }) {
  try {
    const response = await client.search({
      index: openSearchConfig.notificationIndex,
      body: {
        query: {
          bool: {
            must: { match: { channelId } },
          },
        },
        sort: { timestamp: { order: "asc" } },
      },
    });

    console.log(firstResponse.body.hits.length + ' notifications found');
    for (const hit of response.body.hits.hits) {
      await callback(hit._source.payload);
    }
  } catch (e) {
    console.error(e);
    await callback({});
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

module.exports = {
  searchNotification,
};
