const express = require('express');
const { listenToChanges } = require('./openSearch');

const app = express();
const port = process.env.PORT || 4040;

app.get('/sse/notifications', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  listenToChanges((notification) => {
    res.write(`data: ${JSON.stringify(notification)}\n\n`);;
  });

  req.on('close', () => {
    console.log('Client disconnected from SSE');
  });
})

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;
