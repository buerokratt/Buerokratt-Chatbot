import axios, { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const api = axios.create({
  baseURL: import.meta.env.BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  },
  withCredentials: true,
});

const apiDev = axios.create({
  baseURL: import.meta.env.REACT_APP_RUUTER_PRIVATE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  },
  withCredentials: true,
});

const notificationApiDev = axios.create({
  baseURL: import.meta.env.REACT_APP_NOTIFICATION_NODE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  },
  withCredentials: false,
});

const AxiosInterceptor = ({ children }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const resInterceptor = (response: any) => {
      import.meta.env.DEBUG_ENABLED && console.debug(response);

      return response;
    };

    const errInterceptor = (error: any) => {
      import.meta.env.DEBUG_ENABLED && console.debug(error);

      let message = t('global.notificationErrorMsg');

      return Promise.reject(
        new Error(t(`errors.${error.response?.data?.response}`, { defaultValue: message }) ?? message),
      );
    };

    const apiInterceptor = api.interceptors.response.use(resInterceptor, errInterceptor);
    const apiDevInterceptor = apiDev.interceptors.response.use(resInterceptor, errInterceptor);
    const notificationApiDevInterceptor = notificationApiDev.interceptors.response.use(resInterceptor, errInterceptor);

    return () => {
      api.interceptors.response.eject(apiInterceptor);
      notificationApiDev.interceptors.response.eject(notificationApiDevInterceptor);
      apiDev.interceptors.response.eject(apiDevInterceptor);
    };
  }, [t]);

  return children;
};

const handleRequestError = (error: AxiosError) => {
  import.meta.env.DEBUG_ENABLED && console.debug(error);
  if (error.response?.status === 401) {
    // To be added: handle unauthorized requests
  }
  if (error.response?.status === 403) {
    // To be added: handle forbidden requests
  }
  return Promise.reject(new Error(error.message));
};

api.interceptors.request.use((axiosRequest) => axiosRequest, handleRequestError);

apiDev.interceptors.request.use((axiosRequest) => axiosRequest, handleRequestError);

notificationApiDev.interceptors.request.use((axiosRequest) => axiosRequest, handleRequestError);

export { api, apiDev, notificationApiDev, AxiosInterceptor };
