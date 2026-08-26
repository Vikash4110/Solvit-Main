import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 1. Request Interceptor: Automatically attaches the active JWT token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('clientAccessToken') ||
      localStorage.getItem('counselorAccessToken') ||
      localStorage.getItem('adminAccessToken');

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Automatically handles 401 (Expired/Invalid Session)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const pathname = window.location.pathname;

      if (pathname.startsWith('/admin')) {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('admin');
        if (pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } else if (pathname.startsWith('/counselor')) {
        localStorage.removeItem('counselorAccessToken');
        localStorage.removeItem('counselor');
        if (pathname !== '/counselor/login') {
          window.location.href = '/counselor/login';
        }
      } else {
        localStorage.removeItem('clientAccessToken');
        localStorage.removeItem('client');
        if (pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
