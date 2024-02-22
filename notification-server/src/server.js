const express = require("express");
const cors = require("cors");
const { buildSSEResponse } = require("./sseUtil");
const { serverConfig } = require("./config");
const { buildNotificationSearchInterval, buildQueueCounter } = require("./addOns");
const DummyQueueNotForProduction = require('./dummy-queue');

const app = express();

app.use(cors());

app.get("/sse/notifications/:channelId", (req, res) => {
  const { channelId } = req.params;
  buildSSEResponse({
    req,
    res,
    buildCallbackFunction: buildNotificationSearchInterval({ channelId }),
  });
});


app.post("/queue", (req, res) => {
  DummyQueueNotForProduction.add(req.body.id);
  res.sendStatus(200);
});

app.post("/dequeue", (req, res) => {
  DummyQueueNotForProduction.remove(req.body.id);
  res.sendStatus(200);
});

app.get("/sse/queue/:id", (req, res) => {
  buildSSEResponse({ 
    req,
    res,
    buildCallbackFunction: buildQueueCounter,
   });
});

const server = app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});

module.exports = server;
