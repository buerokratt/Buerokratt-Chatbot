const express = require("express");
const cors = require("cors");
const { buildSSEResponse } = require("./sseUtil");
const { serverConfig } = require("./config");

const app = express();

app.use(cors());

app.get("/sse/notifications/:channelId", (req, res) => {
  const { channelId } = req.params;
  buildSSEResponse({ req, res, channelId });
});

const server = app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});

module.exports = server;
