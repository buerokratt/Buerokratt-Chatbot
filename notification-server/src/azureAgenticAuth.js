const { azureAgenticAuthConfig } = require('./config');

const tokenCache = new Map();

async function getAccessToken({ clientId, clientSecret } = {}) {
  const tenantId = azureAgenticAuthConfig.tenantId;
  const grantType = azureAgenticAuthConfig.grantType;
  const scope = azureAgenticAuthConfig.scope;
  const resolvedClientId = clientId || azureAgenticAuthConfig.clientId;
  const resolvedClientSecret = clientSecret || azureAgenticAuthConfig.clientSecret;

  if (!tenantId || !resolvedClientId || !resolvedClientSecret) {
    throw new Error('Azure Agentic authentication credentials are not configured');
  }

  const now = Date.now();
  const cached = tokenCache.get(resolvedClientId);

  if (cached && cached.expireTime - now > 60000) {
    return cached.token;
  }

  try {
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append('grant_type', grantType);
    params.append('client_id', resolvedClientId);
    params.append('client_secret', resolvedClientSecret);
    params.append('scope', scope);

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
    const expiresIn = data.expires_in || 3600;
    tokenCache.set(resolvedClientId, { token: data.access_token, expireTime: now + expiresIn * 1000 });
    return data.access_token;
  } catch (error) {
    console.error('Failed to get Azure Agentic access token:', error);
    throw error;
  }
}

module.exports = {
  getAccessToken,
};
