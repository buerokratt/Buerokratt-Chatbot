const cookieParser = require('cookie-parser');
const cors = require('cors');
const csurf = require('csurf');
const express = require('express');
const helmet = require('helmet');

const { sendAzureAgenticRequest } = require('./azureAgenticRequest');
const { initializeAzureOpenAI } = require('./azureOpenAI');
const { extractMessageTextPart } = require('./citationFormatting');
const { serverConfig } = require('./config');
const { createAzureOpenAIStreamRequest, stoppedChannels } = require('./openSearch');

const app = express();

app.use(cors());
app.use(helmet.hidePoweredBy());
app.use(express.json({ extended: false }));
app.use(cookieParser());
app.use(csurf({ cookie: true, ignoreMethods: ['GET', 'POST'] }));

try {
  initializeAzureOpenAI();
  console.log('Azure OpenAI initialized successfully');
} catch (error) {
  console.error('Failed to initialize Azure OpenAI:', error.message);
}

app.use((req, res, next) => {
  console.log('NEW REQUEST');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  console.log('---------------------------------------------------');
  next();
});

app.post('/channels/:channelId/stream', (req, res) => {
  const { channelId } = req.params;
  const {
    messages,
    options = {},
    use_agentic = false,
    agent_name,
    agent_type,
    azure_client_id,
    azure_client_secret,
    azure_agentic_max_output_tokens,
    structured_inputs,
    raw_response = false,
  } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  res.status(202).json({ response: 'stream triggered' });

  createAzureOpenAIStreamRequest({
    channelId,
    messages,
    options,
    use_agentic,
    agent_name,
    agent_type,
    azure_client_id,
    azure_client_secret,
    azure_agentic_max_output_tokens,
    structured_inputs,
    raw_response,
  }).catch((error) => {
    console.error(`Stream error for channel ${channelId}:`, error.message);
  });
});

app.post('/intent-detection', async (req, res) => {
  const { messages, agent_name, agent_type, azure_client_id, azure_client_secret, azure_agentic_max_output_tokens } =
    req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const response = await sendAzureAgenticRequest(messages, {
      stream: false,
      agent_name,
      agent_type,
      client_id: azure_client_id,
      client_secret: azure_client_secret,
      max_output_tokens: azure_agentic_max_output_tokens,
    });

    res.status(200).json({ content: extractMessageTextPart(response)?.text?.trim() ?? '' });
  } catch (error) {
    const logMessage = String(error?.message ?? error).replace(/[\n\r]/g, ' ');
    console.error('Intent detection error:', logMessage);
    res.status(500).json({ error: 'Failed to detect intent' });
  }
});

app.post('/channels/:channelId/stream/stop', async (req, res) => {
  try {
    const { channelId } = req.params;

    stoppedChannels.add(channelId);

    setTimeout(() => {
      stoppedChannels.delete(channelId);
    }, 1000);

    res.status(200).json();
  } catch (error) {
    console.error(`Error stopping stream for channel ${req.params.channelId}:`, error);
    res.status(200).json();
  }
});

const server = app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});

// Intent detection can wait on an upstream agentic response, so do not impose
// Node's default total request timeout.
server.requestTimeout = 0;
server.headersTimeout = 65_000;
server.keepAliveTimeout = 61_000;

module.exports = server;
