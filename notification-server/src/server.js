const express = require("express");
const cors = require("cors");
const { buildSSEResponse } = require("./sseUtil");
const { serverConfig } = require("./config");
const { buildNotificationSearchInterval, buildQueueCounter } = require("./addOns");

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

app.get("/sse/queue", (req, res) => {
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
