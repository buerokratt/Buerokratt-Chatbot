import { RuuterResponse } from '../model/ruuter-response-model';

const ruuterUrl = import.meta.env.REACT_APP_RUUTER_V1_PRIVATE_API_URL;

interface SseInstance {
  onMessage: <T>(handleData: (data: T) => void) => void;
  close: () => void;
}

const sse = (url: string): SseInstance => {
  const eventSource = new EventSource(`${ruuterUrl}/sse/${url}`, { withCredentials: true });

  const onMessage = <T>(handleData: (data: T) => void) => {
    eventSource.onmessage = (event: MessageEvent) => {
      const response = JSON.parse(event.data);

      if (response.statusCodeValue === 200) {
        const ruuterResponse = response.body as RuuterResponse;
        if (ruuterResponse === null) return;
        if (ruuterResponse.data) handleData(Object.values(ruuterResponse.data)[0] as T);
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
