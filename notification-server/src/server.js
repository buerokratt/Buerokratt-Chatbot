const express = require("express");
const cors = require("cors");
const { buildSSEResponse } = require("./sseUtil");
const { serverConfig } = require("./config");
const {
  buildNotificationSearchInterval,
  buildQueueCounter,
} = require("./addOns");
const { enqueueChatId, dequeueChatId } = require("./openSearch");

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

app.post("/enqueue", async (req, res) => {
  await enqueueChatId(req.body.id);
  res.status(200).json({ response: 'enqueued successfully' });
});

app.post("/dequeue", async (req, res) => {
  await dequeueChatId(req.body.id);
  res.status(200).json({ response: 'dequeued successfully' });
});

const terminationQueue = new Set();

app.post("/add-chat-to-termination-queue", async (req, res) => {
  terminationQueue[req.body.chatId] = req.body;
  res.status(200).json({ response: 'enqueued successfully' });
});

app.post("/remove-chat-from-termination-queue", async (req, res) => {
  const body = terminationQueue[req.body.chatId];
  fetch(`${process.env.RUUTER_URL}/end-chat`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  res.status(200).json({ response: 'dequeued successfully' });
});

const server = app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});

module.exports = server;
