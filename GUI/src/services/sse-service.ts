import { RuuterResponse } from '../model/ruuter-response-model';

const ruuterUrl = import.meta.env.REACT_APP_RUUTER_PRIVATE_API_URL;

const sse = <T>(url: string, onMessage: (data: T) => void): EventSource => {
  const eventSource = new EventSource(`${ruuterUrl}/sse/${url}`, { withCredentials: true });

  eventSource.onmessage = (event: MessageEvent) => {
    const response = JSON.parse(event.data);

    if (response.statusCodeValue === 200) {
      const ruuterResponse = response.body as RuuterResponse;
      if (ruuterResponse?.data)
        onMessage(Object.values(ruuterResponse.data)[0] as T);
    }
  };

  eventSource.onopen = () => {
    console.log("SSE connection Opened");
  };
  
  eventSource.onerror = () => {
    console.error('SSE error');
  };

  return eventSource;
};

export default sse;
