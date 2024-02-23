const express = require("express");
const cors = require("cors");
const { buildSSEResponse } = require("./sseUtil");
const { serverConfig } = require("./config");
const { buildNotificationSearchInterval, buildQueueCounter } = require("./addOns");
const { enqueueChatId, dequeueChatId } = require('./openSearch');

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));

app.get("/sse/notifications/:channelId", (req, res) => {
  const { channelId } = req.params;
  buildSSEResponse({
    req,
    res,
    buildCallbackFunction: buildNotificationSearchInterval({ channelId }),
  });
});

app.get("/sse/queue/:id", (req, res) => {
  const { id } = req.params;
  buildSSEResponse({ 
    req,
    res,
    buildCallbackFunction: buildQueueCounter({ id }),
   });
});

app.post("/enqueue", (req, res) => {
  enqueueChatId(req.body.id);
  res.sendStatus(200);
});

app.post("/dequeue", (req, res) => {
  dequeueChatId(req.body.id);
  res.sendStatus(200);
});

const server = app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});

module.exports = server;
