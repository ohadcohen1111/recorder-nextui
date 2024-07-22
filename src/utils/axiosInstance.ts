// src/utils/axiosInstance.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Modal } from 'antd';
import Cookies from 'js-cookie';
import i18next from 'i18next';
import serverUrl from '../config';
import jwtState from './jwtState'; // Import the JWT state manager

console.log(serverUrl);

const axiosInstance = axios.create({
  baseURL: serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      if (!jwtState.isExpired()) {
        jwtState.setExpired(true);
        Modal.error({
          title: i18next.t('sessionExpiredTitle'),
          content: i18next.t('usageTimeExpired'),
          onOk: () => {
            // Clear token and redirect to login
            Cookies.remove('token');
            window.location.href = '/login';
          },
          centered: true, // This will center the modal
        });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
