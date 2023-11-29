const express = require('express');
const { Client } = require('@elastic/elasticsearch');

const app = express();
const esClient = new Client({ node: 'http://opensearch-node:9200' });

const setSSEHeaders = (res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
}

app.get('/sse/:chatId/messages', (req, res) => {
  const chatId = req.params.chatId;

  setSSEHeaders(res);

  const esStream = esClient.helpers.scrollSearch({
    index: 'sse-events',
    body: {
      query: {
        match: { chatId }
      }
    }
  });

  esStream.on('data', (data) => {
    const event = {
      event: 'update',
      data: JSON.stringify(data),
    };
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  esStream.on('end', () => {
    res.end();
  });

  esStream.on('error', (error) => {
    console.error(error);
    res.end();
  });
});

app.listen(4001, () => {
  console.log('Server running on port 4001');
});
