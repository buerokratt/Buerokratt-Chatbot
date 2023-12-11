import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
  QueryFunction,
} from '@tanstack/react-query';

import App from './App';
import api from 'services/api';
import apiDev from 'services/api-dev';
import { ToastProvider } from 'context/ToastContext';
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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ToastProvider>
          <CookiesProvider>
            <App />
          </CookiesProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
