require('dotenv').config();

module.exports = {
  openSearchConfig: {
    notificationIndex: 'notifications',
    chatQueueIndex: 'chatqueue',
    ssl: {
      rejectUnauthorized: false,
    },
    getUrl: () => {
      const protocol = process.env.OPENSEARCH_PROTOCOL || 'https';
      const username = process.env.OPENSEARCH_USERNAME || 'admin';
      const password = process.env.OPENSEARCH_PASSWORD || 'admin';
      const host = process.env.OPENSEARCH_HOST || 'host.docker.internal';
      const port = process.env.OPENSEARCH_PORT || '9200';

      return `${protocol}://${username}:${password}@${host}:${port}`;
    },
    retry_on_conflict: 6,
  },
  serverConfig: {
    port: process.env.PORT || 4040,
    refreshInterval: process.env.REFRESH_INTERVAL || 1000,
    queueRefreshInterval: process.env.QUEUE_REFRESH_INTERVAL || 2000,
  },
  azureAgenticAuthConfig: {
    grantType: process.env.AZURE_GRANT_TYPE,
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    scope: process.env.AZURE_SCOPE,
  },
  azureAgenticConfig: {
    endpoint: process.env.AZURE_AGENTIC_ENDPOINT,
    apiVersion: process.env.AZURE_AGENTIC_API_VERSION,
    projectName: process.env.AZURE_AGENTIC_PROJECT_NAME,
  },
};
