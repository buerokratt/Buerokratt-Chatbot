import { apiDev } from './api';

export async function fetchConfigurationFromDomain<T>(endpoint: string, domain: string) {
  const { data } = await apiDev.get<T>(endpoint, {
    params: {
      domain: domain ?? 'none',
    },
  });
  return data;
}
