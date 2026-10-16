require('dotenv').config();

module.exports = {
  openSearchConfig: (() => {
    const fs = require('fs');
    const origin = new URL(process.env.OPENSEARCH_URL);
    if (!['https:', 'http:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Invalid Central origin');
    if (origin.protocol === 'http:' && process.env.OPENSEARCH_ALLOW_HTTP !== 'true') throw new Error('HTTP requires explicit opt-in');
    const username = fs.readFileSync(process.env.OPENSEARCH_USERNAME_FILE, 'utf8');
    const password = fs.readFileSync(process.env.OPENSEARCH_PASSWORD_FILE, 'utf8');
    if (!username || !password || username.includes(':') || /[\x00-\x1f]/.test(username + password)) throw new Error('Invalid credential files');
    if (process.env.OPENSEARCH_INDEX_PREFIX !== 'central-byk-test-chatbot-') throw new Error('Invalid installation prefix');
    return { notificationIndex: process.env.OPENSEARCH_INDEX_PREFIX + 'notifications', chatQueueIndex: process.env.OPENSEARCH_INDEX_PREFIX + 'chatqueue',
      ssl: { rejectUnauthorized: true, ...(process.env.OPENSEARCH_CA_FILE ? { ca: fs.readFileSync(process.env.OPENSEARCH_CA_FILE) } : {}) },
      auth: { username, password }, getUrl: () => origin.origin, retry_on_conflict: 6 };
  })(),
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
    maxOutputTokens: process.env.AZURE_AGENTIC_MAX_OUTPUT_TOKENS,
  },
};
