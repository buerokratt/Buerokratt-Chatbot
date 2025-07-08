const express = require("express");
const cors = require("cors");
const { buildSSEResponse } = require("./sseUtil");
const { serverConfig } = require("./config");
const {
  buildNotificationSearchInterval,
  buildQueueCounter,
} = require("./addOns");
const { enqueueChatId, dequeueChatId, sendBulkNotification } = require("./openSearch");
const { addToTerminationQueue, removeFromTerminationQueue } = require("./terminationQueue");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");

const app = express();

app.use(cors());
app.use(helmet.hidePoweredBy());
app.use(express.json({ extended: false }));
app.use(cookieParser());
app.use(csurf({ cookie: true, ignoreMethods: ['GET', 'POST']}));

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

app.post("/bulk-notifications", async (req, res) => {
  try {
    await sendBulkNotification(req.body);
    res.status(200).json({ response: 'sent successfully' });
  } catch {
    res.status(500).json({ response: 'error' });
  }
});

app.post("/enqueue", async (req, res) => {
  try{
    await enqueueChatId(req.body.id);
    res.status(200).json({ response: 'enqueued successfully' });
  } catch {
    res.status(500).json({ response: 'error' });
  }
});

app.post("/dequeue", async (req, res) => {
  try {
    await dequeueChatId(req.body.id);
    res.status(200).json({ response: 'dequeued successfully' });
  } catch {
    res.status(500).json({ response: 'error' });
  }
});

app.post("/add-chat-to-termination-queue", express.json(), express.text(), (req, res) => {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    
    addToTerminationQueue(
      body.chatId,
      () => fetch(`${process.env.RUUTER_URL}/chats/end`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'cookie': body.cookie || req.headers.cookie,
        },
        body: JSON.stringify({
          message: {
            chatId: body.chatId,
            authorRole: 'end-user',
            event: 'CLIENT_LEFT_FOR_UNKNOWN_REASONS',
            authorTimestamp: new Date().toISOString(),
          }
        }),
      })
    );

    res.status(200).json({ response: 'Chat will be terminated soon' });
  } catch (error) {
    res.status(500).json({ response: 'error' });
  }
});

app.post("/remove-chat-from-termination-queue", (req, res) => {
  try {
    removeFromTerminationQueue(req.body.chatId);
    res.status(200).json({ response: 'Chat termination will be canceled' });
  } catch {
    res.status(500).json({ response: 'error' });
  }
});

const server = app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});

module.exports = server;
