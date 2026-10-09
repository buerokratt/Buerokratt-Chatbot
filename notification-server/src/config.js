require('dotenv').config();

module.exports = {
  serverConfig: {
    port: process.env.PORT || 4040,
  },
  newNotificationsConfig: {
    eventUrl: process.env.NEW_NOTIFICATIONS_NODE_EVENT_URL,
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
