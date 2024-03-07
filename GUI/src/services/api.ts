import axios, { AxiosError } from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

instance.interceptors.response.use(
  (axiosResponse) => {
    return axiosResponse;
  },
  (error: AxiosError) => {
    console.log(error);
    return Promise.reject(error);
  }
);

instance.interceptors.request.use(
  (axiosRequest) => {
    return axiosRequest;
  },
  (error: AxiosError) => {
    console.log(error);
    if (error.response?.status === 401) {
      //TODO: handle unauthorized requests
    }
    if (error.response?.status === 403) {
      //TODO: handle unauthorized requests
    }
    return Promise.reject(error);
  }
);

export default instance;
