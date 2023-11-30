const express = require('express');
const { buildSSEResponse } = require('./sseUtil');

const app = express();
const port = process.env.PORT || 4040;

app.get('/sse/notifications/users/:userId', (req, res) => {
  const { userId } = req.params; // TODO: extract userId from TIM
  buildSSEResponse({req, res, searchParms: { userId }});
});

app.get('/sse/notifications/chats/:chatId', (req, res) => {
  const { chatId } = req.params;
  buildSSEResponse({req, res, searchParms: { chatId }});
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;
