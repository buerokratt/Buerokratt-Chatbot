const { azureAgenticAuthConfig } = require('./config');

let cachedToken = null;
let tokenExpireTime = 0;

async function getAccessToken() {
  const now = Date.now();

  if (cachedToken && tokenExpireTime - now > 60000) {
    return cachedToken;
  }

  if (!azureAgenticAuthConfig.tenantId || !azureAgenticAuthConfig.clientId || !azureAgenticAuthConfig.clientSecret) {
    throw new Error('Azure Agentic authentication credentials are not configured');
  }

  try {
    const tokenUrl = `https://login.microsoftonline.com/${azureAgenticAuthConfig.tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append('grant_type', azureAgenticAuthConfig.grantType);
    params.append('client_id', azureAgenticAuthConfig.clientId);
    params.append('client_secret', azureAgenticAuthConfig.clientSecret);
    params.append('scope', azureAgenticAuthConfig.scope);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Azure token request failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    const expiresIn = data.expires_in || 3600;
    tokenExpireTime = now + expiresIn * 1000;
    return cachedToken;
  } catch (error) {
    console.error('Failed to get Azure Agentic access token:', error);
    throw error;
  }
}

module.exports = {
  getAccessToken,
};
