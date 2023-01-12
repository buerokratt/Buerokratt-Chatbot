import { RouterResponse } from 'types/router';

interface SSEInstance {
  onMessage: <T>(handleData: (data: T) => void) => void;
  close: () => void;
}

const sse = (url: string): SSEInstance => {
  const eventSource = new EventSource(`${import.meta.env.REACT_APP_RUUTER_API_URL}/sse/${url}`, { withCredentials: true });

  const onMessage = <T>(handleData: (data: T) => void) => {
    eventSource.onmessage = (event: MessageEvent) => {
      const response = JSON.parse(event.data);

      if (response.statusCodeValue === 200) {
        const routerResponse = response.body as RouterResponse;
        if (routerResponse.data) handleData(Object.values(routerResponse.data)[0] as T);
      }
    };
  };

  const close = () => {
    eventSource.close();
  };

  eventSource.onerror = () => {
    eventSource.close();
  };

  return { onMessage, close };
};

export default sse;
