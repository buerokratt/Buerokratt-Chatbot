const { searchNotification } = require('./openSearch');
const { serverConfig } = require('./config');

function buildSSEResponse({
  res,
  req,
  channelId,
  interval = serverConfig.refreshInterval,
}) {

  const origin = extractOrigin(req.headers.origin);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Expose-Headers': 'Origin, X-Requested-With, Content-Type, Cache-Control, Connection, Accept'
  });

  res.write('');

  const callback = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  
  const intervalHandle = setInterval(() => 
    searchNotification({
      channelId,
      callback,
    }),
    interval
  );

  req.on('close', () => {
    console.log('Client disconnected from SSE');
    clearInterval(intervalHandle);
  });
}

function extractOrigin(reqOrigin) {
  const corsWhitelist = process.env.CORS_WHITELIST_ORIGINS.split(',');
  const whitelisted = corsWhitelist.indexOf(reqOrigin) !== -1;
  return whitelisted ? reqOrigin : '*';
}

module.exports = {
  buildSSEResponse,
};
