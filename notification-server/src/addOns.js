const { searchNotification } = require('./openSearch');
const { serverConfig } = require('./config');

function buildNotificationSearchInterval({ 
  channelId,
  interval = serverConfig.refreshInterval,
 }) {
  return ({ connectionId, sender }) => {
    const intervalHandle = setInterval(() => 
      searchNotification({
        connectionId,
        channelId,
        sender,
      }),
      interval
    );

    return () => clearInterval(intervalHandle);
  };
}

function buildQueueCounter({ sender }) {
  sender(5); // to-do: implement queue counter
}

module.exports = {
  buildNotificationSearchInterval,
  buildQueueCounter,
};
