const { v4: uuidv4 } = require('uuid');
const { searchNotification } = require('./openSearch');
const { serverConfig } = require('./config');

function buildSSEResponse({
  res,
  req,
  channelId,
  interval = serverConfig.refreshInterval,
}) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write('');

  const connectionId = uuidv4();
  const callback = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  
  const intervalHandle = setInterval(() => 
    searchNotification({
      channelId,
      connectionId,
      callback,
    }),
    interval
  );

  req.on('close', () => {
    console.log('Client disconnected from SSE');
    clearInterval(intervalHandle);
  });
}

module.exports = {
  buildSSEResponse,
};
