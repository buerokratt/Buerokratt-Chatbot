const { v4: uuidv4 } = require('uuid');
const streamQueue = require('./streamQueue');
const { createAzureOpenAIStreamRequest } = require('./openSearch');
const { activeConnections } = require('./connectionManager');

function buildSSEResponse({ res, req, buildCallbackFunction, channelId }) {
  addSSEHeader(req, res);
  keepStreamAlive(res);
  const connectionId = generateConnectionID();
  const sender = buildSender(res);

  activeConnections.set(connectionId, {
    res,
    sender,
    channelId,
  });

  if (channelId) {
    setTimeout(() => {
      processPendingStreamsForChannel(channelId);
    }, 1000);
  }

  const cleanUp = buildCallbackFunction({ connectionId, sender });

  req.on('close', () => {
    console.log(`Client disconnected from SSE for channel ${channelId}`);
    activeConnections.delete(connectionId);
    cleanUp?.();
  });
}

function addSSEHeader(req, res) {
  const origin = extractOrigin(req.headers.origin);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Expose-Headers': 'Origin, X-Requested-With, Content-Type, Cache-Control, Connection, Accept',
  });
}

function extractOrigin(reqOrigin) {
  const corsWhitelist = process.env.CORS_WHITELIST_ORIGINS.split(',');
  const whitelisted = corsWhitelist.indexOf(reqOrigin) !== -1;
  return whitelisted ? reqOrigin : '*';
}

function keepStreamAlive(res) {
  res.write('');
}

function generateConnectionID() {
  const connectionId = uuidv4();
  console.log(`New client connected with connectionId: ${connectionId}`);
  return connectionId;
}

function buildSender(res) {
  return (data) => {
    try {
      const formattedData = typeof data === 'string' ? data : JSON.stringify(data);
      res.write(`data: ${formattedData}\n\n`);
      if (typeof res.flush === 'function') {
        res.flush();
      }
    } catch (error) {
      console.error('SSE write error:', error);
    }
  };
}

function processPendingStreamsForChannel(channelId) {
  const pendingRequests = streamQueue.getPendingRequests(channelId);

  if (pendingRequests.length > 0) {
    pendingRequests.forEach(async (requestData) => {
      if (streamQueue.shouldRetry(requestData)) {
        try {
          await createAzureOpenAIStreamRequest({
            channelId,
            messages: requestData.messages,
            options: requestData.options,
          });

          streamQueue.removeFromQueue(channelId, requestData.id);
        } catch (error) {
          console.error(`Failed to process queued stream for channel ${channelId}:`, error);
          streamQueue.incrementRetryCount(channelId, requestData.id);
        }
      } else {
        streamQueue.removeFromQueue(channelId, requestData.id);
      }
    });
  }
}

module.exports = {
  activeConnections,
  buildSSEResponse,
  processPendingStreamsForChannel,
};
