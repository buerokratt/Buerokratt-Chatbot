const { searchNotification } = require('./openSearch');
const { v4: uuidv4 } = require('uuid');

function buildSSEResponse({
  res,
  req,
  searchParms,
  interval = process.env.REFRESH_INTERVAL || 1000,
}) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write('');

  const connectionId = uuidv4();
  const lastTimestamp = Date.now();
  const writer = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  
  console.log({ connectionId });

  const intervalHandle = setInterval(() => 
    searchNotification(
      searchParms,
      connectionId,
      lastTimestamp,
      writer,
    ),
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
