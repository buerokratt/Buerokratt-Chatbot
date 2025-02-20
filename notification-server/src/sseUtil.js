const { v4: uuidv4 } = require('uuid');

function buildSSEResponse({ res, req, buildCallbackFunction }) {
  addSSEHeader(req, res);
  keepStreamAlive(res);
  const connectionId = generateConnectionID();
  const sender = buildSender(res);
  
  const cleanUp = buildCallbackFunction({ connectionId, sender });

  // todo on close here
  req.on('close', () => {
    console.log('Client disconnected from SSE');
    cleanUp?.();
  });
}

function addSSEHeader(req, res) {
  const origin = extractOrigin(req.headers.origin);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Expose-Headers': 'Origin, X-Requested-With, Content-Type, Cache-Control, Connection, Accept'
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
  return data => res.write(`data: ${JSON.stringify(data)}\n\n`);
}

module.exports = {
  buildSSEResponse,
};
