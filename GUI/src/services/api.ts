import axios, { AxiosError } from 'axios';
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const api = axios.create({
  baseURL: import.meta.env.BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const apiDev = axios.create({
  baseURL: import.meta.env.REACT_APP_RUUTER_PRIVATE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const AxiosInterceptor = ({ children }) => {
  const { t } = useTranslation();

  useEffect(() => {

    const resInterceptor = (response: any) => {
      import.meta.env.DEBUG_ENABLED && console.log(response);

      return response;
    }

    const errInterceptor = (error: any) => {
      import.meta.env.DEBUG_ENABLED && console.log(error);

      let message = t('global.notificationErrorMsg');

      return Promise.reject(new Error(message));
    }

    const apiInterceptor = api.interceptors.response.use(resInterceptor, errInterceptor);
    const apiDevInterceptor = apiDev.interceptors.response.use(resInterceptor, errInterceptor);

    return () => {
      api.interceptors.response.eject(apiInterceptor);
      apiDev.interceptors.response.eject(apiDevInterceptor);
    };
  }, [t])
  return children;
}

const handleRequestError = (error: AxiosError) => {
  console.log(error);
  if (error.response?.status === 401) {
    // To be added: handle unauthorized requests
  }
  if (error.response?.status === 403) {
    // To be added: handle forbidden requests
  }
  return Promise.reject(new Error(error.message));
}

api.interceptors.request.use(
  (axiosRequest) => axiosRequest,
  handleRequestError
);

apiDev.interceptors.request.use(
  (axiosRequest) => axiosRequest,
  handleRequestError
);

export { api, apiDev, AxiosInterceptor };
