const { Client } = require('@opensearch-project/opensearch');
const { openSearchConfig } = require('./config');

const client = new Client({
  node: openSearchConfig.getUrl(),
  ssl: openSearchConfig.ssl,
});

async function searchNotification(match, connectionId, callback) {
  const body = {
    query: {
      bool: {
        must: [{ match }],
        must_not: { match: { sentTo: connectionId }}
      }
    }
  }

  const response = await client.search({
    index: openSearchConfig.notificationIndex,
    body
  });

  for (const hit of response.body.hits.hits) {
    await callback(hit._source.payload);
    await markAsSeen(hit, connectionId);
  }
}

async function markAsSeen(hit, connectionId) {
  const { _index, _id } = hit;

  await client.update({
    index: _index,
    id: _id,
    retry_on_conflict: 6,
    body: {
      script: {
        source: `if (ctx._source.sentTo == null) {
          ctx._source.sentTo = [params.connectionId];
        } else {
          ctx._source.sentTo.add(params.connectionId);
        }`,
        lang: 'painless',
        params: { connectionId}
      }
    }
  });
}

module.exports = {
  searchNotification,
};
