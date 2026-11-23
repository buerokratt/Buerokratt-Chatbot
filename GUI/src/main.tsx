import { createNotificationsClient } from '@buerokratt-ria/notifications';
import { NotificationsProvider } from '@buerokratt-ria/notifications/react';
import { QueryClient, QueryClientProvider, QueryFunction } from '@tanstack/react-query';
import { ToastProvider } from 'context/ToastContext';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { api, apiDev, AxiosInterceptor } from 'services/api';

import App from './App';

import 'styles/main.scss';
import '../i18n';
import { CookiesProvider } from 'react-cookie';

const defaultQueryFn: QueryFunction | undefined = async ({ queryKey }) => {
  if (queryKey.includes('prod')) {
    const { data } = await apiDev.get(queryKey[0] as string);
    return data;
  }

  const { data } = await api.get(queryKey[0] as string);
  return data;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});

const notificationsClient = createNotificationsClient({
  apiBaseUrl: import.meta.env.REACT_APP_NEW_NOTIFICATION_NODE_URL,
  vapidPublicKey: import.meta.env.REACT_APP_NOTIFICATIONS_VAPID_PUBLIC_KEY,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AxiosInterceptor>
          <ToastProvider>
            <CookiesProvider>
              <NotificationsProvider client={notificationsClient}>
                <App />
              </NotificationsProvider>
            </CookiesProvider>
          </ToastProvider>
        </AxiosInterceptor>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
