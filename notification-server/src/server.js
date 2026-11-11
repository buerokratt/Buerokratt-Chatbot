const cookieParser = require('cookie-parser');
const cors = require('cors');
const csurf = require('csurf');
const express = require('express');
const helmet = require('helmet');

const { sendAzureAgenticRequest } = require('./azureAgenticRequest');
const { extractMessageTextPart } = require('./citationFormatting');
const { serverConfig } = require('./config');
const { createAgenticStreamRequest, stoppedChannels } = require('./openSearch');

const app = express();

app.use(cors());
app.use(helmet.hidePoweredBy());
app.use(express.json({ extended: false }));
app.use(cookieParser());
app.use(csurf({ cookie: true, ignoreMethods: ['GET', 'POST'] }));

// LLM Module GUI streaming connection
app.get('/sse/stream/:channelId', (req, res) => {
  const { channelId } = req.params;
  // Strip line breaks so the request value cannot inject fake log lines
  const logChannelId = channelId.replace(/[\n\r]/g, '');
  buildSSEResponse({
    req,
    res,
    buildCallbackFunction: ({ connectionId }) => {
      // For streaming SSE, we don't set up an interval
      // Instead, we wait for POST requests to trigger streaming
      console.log(`SSE streaming connection established for channel ${logChannelId}, connection ${connectionId}`);

      // Return cleanup function (no-op for streaming connections)
      return () => {
        console.log(`SSE streaming connection closed for channel ${logChannelId}, connection ${connectionId}`);
      };
    },
    channelId,
    llmStream: true,
  });
});

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

  createAgenticStreamRequest({
    channelId,
    messages,
    options,
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
