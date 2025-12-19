const express = require('express');
const cors = require('cors');
const { buildSSEResponse } = require('./sseUtil');
const { serverConfig } = require('./config');
const { buildNotificationSearchInterval, buildQueueCounter } = require('./addOns');
const { enqueueChatId, dequeueChatId, sendBulkNotification, createAzureOpenAIStreamRequest } = require('./openSearch');
const { addToTerminationQueue, removeFromTerminationQueue } = require('./terminationQueue');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const { initializeAzureOpenAI } = require('./azureOpenAI');
const streamQueue = require('./streamQueue');
const { addToLogoutQueue, removeFromLogoutQueue } = require('./logoutQueue');

const app = express();

app.use(cors());
app.use(helmet.hidePoweredBy());
app.use(express.json({ extended: false }));
app.use(cookieParser());
app.use(csurf({ cookie: true, ignoreMethods: ['GET', 'POST'] }));

try {
  initializeAzureOpenAI();
  console.log('Azure OpenAI initialized successfully');
} catch (error) {
  console.error('Failed to initialize Azure OpenAI:', error.message);
}

app.get('/sse/notifications/:channelId', (req, res) => {
  const { channelId } = req.params;
  buildSSEResponse({
    req,
    res,
    buildCallbackFunction: buildNotificationSearchInterval({ channelId }),
    channelId,
  });
});

app.get('/sse/queue/:id', (req, res) => {
  const { id } = req.params;
  buildSSEResponse({
    req,
    res,
    buildCallbackFunction: buildQueueCounter({ id }),
  });
});

app.use((req, res, next) => {
  console.log('NEW REQUEST');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  console.log('---------------------------------------------------');
  next();
});

app.post('/bulk-notifications', async (req, res) => {
  try {
    await sendBulkNotification(req.body);
    res.status(200).json({ response: 'sent successfully' });
  } catch {
    res.status(500).json({ response: 'error' });
  }
});

app.post('/add-to-logout-queue', async (req, res) => {
  const cookies = req.headers.cookie;

  try {
    await addToLogoutQueue(cookies, 5, () =>
      fetch(`${process.env.PRIVATE_RUUTER_URL}/backoffice/accounts/logout`, {
        method: 'GET',
        headers: {
          cookie: cookies,
        },
      }),
    );

    console.log('User was loged out.');
    res.sendStatus(200);
  } catch (err) {
    console.error('Error forwarding request:', JSON.stringify(err));
    res.sendStatus(500);
  }
});

app.post('/remove-from-logout-queue', async (req, res) => {
  try {
    await removeFromLogoutQueue(req.headers.cookie);
    res.status(200).json({ response: 'Logout would be canceled' });
  } catch {
    res.status(500).json({ response: 'error' });
  }
});

app.post('/enqueue', async (req, res) => {
  try {
    await enqueueChatId(req.body.id);
    res.status(200).json({ response: 'enqueued successfully' });
  } catch {
    res.status(500).json({ response: 'error' });
  }
});

app.post('/dequeue', async (req, res) => {
  try {
    await dequeueChatId(req.body.id);
    res.status(200).json({ response: 'dequeued successfully' });
  } catch {
    res.status(500).json({ response: 'error' });
  }
});

app.post('/add-chat-to-termination-queue', express.json(), express.text(), async (req, res) => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    addToTerminationQueue(body.chatId, body.timeout, () =>
      fetch(`${process.env.RUUTER_URL}/backoffice/chats/end`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: body.cookie || req.headers.cookie,
        },
        body: JSON.stringify({
          message: {
            chatId: body.chatId,
            authorRole: 'end-user',
            event: 'CLIENT_LEFT_FOR_UNKNOWN_REASONS',
            authorTimestamp: new Date().toISOString(),
          },
        }),
      }),
    );

    res.status(200).json({ response: 'Chat will be terminated soon' });
  } catch (error) {
    console.error('Error adding chat to termination queue:', error);
    res.status(500).json({ response: 'error' });
  }
});

app.post('/remove-chat-from-termination-queue', express.json(), express.text(), async (req, res) => {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  try {
    removeFromTerminationQueue(body.chatId);
    res.status(200).json({ response: 'Chat termination will be canceled' });
  } catch {
    res.status(500).json({ response: 'error' });
  }
});

app.post('/channels/:channelId/stream', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { messages, options = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const result = await createAzureOpenAIStreamRequest({
      channelId,
      messages,
      options,
    });

    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('No active connections found for this channel - request queued')) {
      res.status(202).json({
        message: 'Request queued - will be processed when connection becomes available',
        status: 'queued',
      });
    } else if (error.message === 'No active connections found for this channel') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to start streaming' });
    }
  }
});

setInterval(
  () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const [channelId, requests] of streamQueue.queue.entries()) {
      const staleRequests = requests.filter((req) => now - req.timestamp > oneHour || !streamQueue.shouldRetry(req));

      staleRequests.forEach((staleReq) => {
        streamQueue.removeFromQueue(channelId, staleReq.id);
        console.log(`Cleaned up stale stream request for channel ${channelId}`);
      });
    }
  },
  5 * 60 * 1000,
);

const server = app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});

module.exports = server;
