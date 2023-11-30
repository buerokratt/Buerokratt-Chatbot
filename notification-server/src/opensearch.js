const { Client } = require('@elastic/elasticsearch');
const { openSearchConfig } = require('./config');

const client = new Client({
  node: openSearchConfig.node,
  auth: openSearchConfig.auth,
});

// await client.indices.putSettings({
//   index: 'notifications',
//   body: {
//     refresh_interval: '5s',
//   },
// });

async function listenToChanges(callback) {
  const { body } = await client.helpers.scrollSearch({
    index: 'notifications',
    scroll: '30s',
    body: {
      query: {
        bool: {
          filter: { term: { state: 'new' } },
        },
      },
    },
  });

  for (const hit of body.hits.hits) {
    callback(hit._source);
    markNotificationAsSent(hit._source._id);
  }
}

async function markNotificationAsSent(notificationId) {
  await client.update({
    index: 'notifications',
    id: notificationId,
    body: {
      doc: {
        state: 'sent',
      },
    },
  });
}

module.exports = { 
  client,
  listenToChanges,
  markNotificationAsSent,
};
