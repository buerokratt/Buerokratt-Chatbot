const { searchNotification } = require('./openSearch');
const { serverConfig } = require('./config');
const DummyQueueNotForProduction = require('./dummy-queue');

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

// to-do: implement queue counter
function buildQueueCounter({
  id,
  interval = serverConfig.refreshInterval,
}) {
  return ({ sender }) => {
    let lastOrder = 0;
    const intervalHandle = setInterval(() => {
        const order = DummyQueueNotForProduction.findOrder(id);
        if(order == lastOrder)
          return;
        lastOrder = order;
        sender(order)
      },
      interval
    );

    return () => clearInterval(intervalHandle);
  }
}

module.exports = {
  buildNotificationSearchInterval,
  buildQueueCounter,
};
