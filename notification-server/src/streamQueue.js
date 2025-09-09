const { v4: uuidv4 } = require("uuid");

class StreamQueue {
  constructor() {
    this.queue = new Map();
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  addToQueue(channelId, requestData) {
    if (!this.queue.has(channelId)) {
      this.queue.set(channelId, []);
    }

    const requestWithMetadata = {
      ...requestData,
      retryCount: 0,
      timestamp: Date.now(),
      id: uuidv4(),
    };

    this.queue.get(channelId).push(requestWithMetadata);
    return requestWithMetadata.id;
  }

  getPendingRequests(channelId) {
    return this.queue.get(channelId) || [];
  }

  removeFromQueue(channelId, requestId) {
    if (!this.queue.has(channelId)) return false;

    const requests = this.queue.get(channelId);
    const index = requests.findIndex((req) => req.id === requestId);

    if (index !== -1) {
      requests.splice(index, 1);
      if (requests.length === 0) {
        this.queue.delete(channelId);
      }
      return true;
    }
    return false;
  }

  clearChannelQueue(channelId) {
    return this.queue.delete(channelId);
  }

  shouldRetry(request) {
    return request.retryCount < this.maxRetries;
  }

  incrementRetryCount(channelId, requestId) {
    if (!this.queue.has(channelId)) return false;

    const requests = this.queue.get(channelId);
    const request = requests.find((req) => req.id === requestId);

    if (request) {
      request.retryCount++;
      request.lastRetry = Date.now();
      return true;
    }
    return false;
  }
}

module.exports = new StreamQueue();
