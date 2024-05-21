const notificationNodeUrl = import.meta.env.REACT_APP_NOTIFICATION_NODE_URL;

const sse = <T>(url: string, onMessage: (data: T) => void): EventSource => {
  if (!notificationNodeUrl) {
    console.error('Notification node url is not defined');
    throw new Error('Notification node url is not defined');
  }
  const eventSource = new EventSource(
    `${notificationNodeUrl}/sse/notifications${url}`
  );

  eventSource.onmessage = (event: MessageEvent) => {
    if (event.data != undefined && event.data != 'undefined') {
      const response = JSON.parse(event.data);
      if (response != undefined) {
        onMessage(Object.values(response)[0] as T);
      }
    }
  };

  eventSource.onopen = () => {
    console.log('SSE connection Opened');
  };

  eventSource.onerror = () => {};

  return eventSource;
};

export default sse;
