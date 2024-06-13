const { searchNotification, findChatIdOrder } = require('./openSearch');
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

function buildQueueCounter({
  id,
  interval = serverConfig.queueRefreshInterval,
}) {
  return ({ sender }) => {
    let lastOrder = 0;
    const intervalHandle = setInterval(async () => {
        try {
          const order = await findChatIdOrder(id);
        
          if(order == lastOrder)
            return;
          lastOrder = order;
          sender({ order });
        } catch (error) {
          console.log(error);
        }
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
