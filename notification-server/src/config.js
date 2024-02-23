require('dotenv').config();

module.exports = {
  openSearchConfig: {
    notificationIndex: 'notifications',
    chatQueueIndex: 'chatQueue',
    ssl: {
      rejectUnauthorized: false 
    },
    getUrl: () => {
      const protocol = process.env.OPENSEARCH_PROTOCOL || 'https';
      const username = process.env.OPENSEARCH_USERNAME || 'admin';
      const password = process.env.OPENSEARCH_PASSWORD || 'admin';
      const host = process.env.OPENSEARCH_HOST || 'host.docker.internal';
      const port = process.env.OPENSEARCH_PORT || '9200';
            
      return `${protocol}://${username}:${password}@${host}:${port}`
    },
    retry_on_conflict: 6,
  },
  serverConfig: {
    port: process.env.PORT || 4040,
    refreshInterval: process.env.REFRESH_INTERVAL || 1000,
  },
};


