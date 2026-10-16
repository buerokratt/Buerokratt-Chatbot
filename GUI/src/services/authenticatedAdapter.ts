import axios, { AxiosAdapter, AxiosInstance } from 'axios';

// TIM invalidates the predecessor token during renewal. Hold an origin-wide
// lock for the complete network exchange, including the successor cookie.
const coordinated = new WeakSet<AxiosInstance>();

export function coordinateAuthenticatedRequests(client: AxiosInstance): void {
  if (coordinated.has(client)) return;
  coordinated.add(client);
  const transport = axios.getAdapter(client.defaults.adapter);
  const adapter: AxiosAdapter = async (config) => {
    if (!globalThis.navigator?.locks?.request) {
      throw new Error('Authenticated requests require a secure origin with Web Locks');
    }
    return navigator.locks.request('byrokratt-private-session-v1', { mode: 'exclusive' }, async () => {
      config.cancelToken?.throwIfRequested();
      if (config.signal?.aborted) throw new axios.CanceledError('Request canceled while waiting for session lock');
      return transport(config);
    });
  };
  client.defaults.adapter = adapter;
  client.defaults.timeout = 30000;
}
