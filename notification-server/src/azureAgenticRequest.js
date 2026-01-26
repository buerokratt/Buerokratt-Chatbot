const { getAccessToken } = require('./azureAgenticAuth');
const { azureAgenticConfig } = require('./config');

function handleSSELines(lines, yieldFn) {
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      try {
        const parsed = JSON.parse(data);
        yieldFn(parsed);
      } catch (e) {
        console.error('Error parsing SSE data:', e);
      }
    }
  }
}

async function* parseSSEStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      const yielded = [];
      handleSSELines(lines, (parsed) => yielded.push(parsed));
      for (const item of yielded) {
        yield item;
      }
    }

    if (buffer && buffer.startsWith('data: ')) {
      try {
        const parsed = JSON.parse(buffer.slice(6));
        yield parsed;
      } catch (e) {
        console.error('Error parsing final SSE data:', e);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function sendAzureAgenticRequest(messages, options = {}) {
  const { max_output_tokens = 4000, stream = false, agent_name, agent_type } = options;

  if (!azureAgenticConfig.endpoint || !azureAgenticConfig.projectName) {
    throw new Error('Azure Agentic endpoint and project name are required');
  }

  if (!agent_name) {
    throw new Error('Agent name is required for agentic requests');
  }

  if (!agent_type) {
    throw new Error('Agent type is required for agentic requests');
  }

  try {
    const accessToken = await getAccessToken();

    const requestUrl = `${azureAgenticConfig.endpoint}/api/projects/${azureAgenticConfig.projectName}/openai/responses?api-version=${azureAgenticConfig.apiVersion}`;

    const requestBody = {
      input: messages.filter((msg) => msg.role !== 'system'),
      agent: {
        name: agent_name,
        type: agent_type,
      },
      stream: stream,
      max_output_tokens: max_output_tokens,
    };

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(requestUrl, fetchOptions);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Azure Agentic API request failed: ${response.status} - ${errorData}`);
    }

    if (stream) {
      return parseSSEStream(response);
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('Azure Agentic API error:', error);
    throw error;
  }
}

module.exports = {
  sendAzureAgenticRequest,
};
