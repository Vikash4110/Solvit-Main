import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Role-isolated in-memory token store (Closure)
let memoryTokens = {
  client: null,
  counselor: null,
  admin: null,
};

export const setMemoryToken = (role, token) => {
  if (role && Object.prototype.hasOwnProperty.call(memoryTokens, role)) {
    memoryTokens[role] = token || null;
  }
};

export const getMemoryToken = (role) => {
  if (role && Object.prototype.hasOwnProperty.call(memoryTokens, role)) {
    return memoryTokens[role];
  }
  return null;
};

export const clearMemoryTokens = () => {
  memoryTokens = { client: null, counselor: null, admin: null };
};

// Helper to resolve active token with backward-compatible storage fallback during migration
export const getActiveToken = (role) => {
  if (memoryTokens[role]) {
    return memoryTokens[role];
  }
  try {
    return localStorage.getItem(`${role}AccessToken`);
  } catch {
    return null;
  }
};

// Determine role context from URL path or current browser location
const getContextRole = (url = '', pathname = window.location.pathname) => {
  if (pathname.startsWith('/admin') || url.includes('/admin')) return 'admin';
  if (pathname.startsWith('/counselor') || url.includes('/counselor')) return 'counselor';
  return 'client';
};

const getRefreshEndpoint = (role) => {
  if (role === 'admin') return API_ENDPOINTS.ADMIN_REFRESH_TOKEN || '/admin/refresh-token';
  if (role === 'counselor')
    return API_ENDPOINTS.COUNSELOR_REFRESH_TOKEN || '/counselors/refresh-token';
  return API_ENDPOINTS.CLIENT_REFRESH_TOKEN || '/clients/refresh-token';
};

// 1. Request Interceptor: Injects the active access token
api.interceptors.request.use(
  (config) => {
    const pathname = window.location.pathname;
    const url = config.url || '';
    const role = getContextRole(url, pathname);

    let token = getActiveToken(role);
    if (!token) {
      if (role === 'client') {
        token = getActiveToken('counselor') || getActiveToken('admin');
      } else if (role === 'counselor') {
        token = getActiveToken('client') || getActiveToken('admin');
      }
    }

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency-Safe Silent Refresh Queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Response Interceptor: Catches HTTP 401 and manages silent refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response?.status === 401;
    const isRefreshOrAuthCall =
      originalRequest.url?.includes('refresh-token') ||
      originalRequest.url?.includes('login') ||
      originalRequest.url?.includes('register');

    if (is401 && !originalRequest._retry && !isRefreshOrAuthCall) {
      const pathname = window.location.pathname;
      const role = getContextRole(originalRequest.url, pathname);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshEndpoint = getRefreshEndpoint(role);

      try {
        const refreshResponse = await api.post(refreshEndpoint);
        const newAccessToken = refreshResponse.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Refresh response missing access token');
        }

        setMemoryToken(role, newAccessToken);
        try {
          localStorage.setItem(`${role}AccessToken`, newAccessToken);
        } catch {
          // Ignore localStorage access restrictions in private browsing modes
        }

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearMemoryTokens();

        try {
          localStorage.removeItem('clientAccessToken');
          localStorage.removeItem('counselorAccessToken');
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('client');
          localStorage.removeItem('counselor');
          localStorage.removeItem('admin');
        } catch {
          // Ignore localStorage access restrictions
        }

        const isPublicRoute =
          pathname === '/' ||
          pathname.startsWith('/about') ||
          pathname.startsWith('/services') ||
          pathname.startsWith('/blogs') ||
          pathname.startsWith('/contact') ||
          pathname.startsWith('/login') ||
          pathname.includes('/register');

        if (!isPublicRoute) {
          if (role === 'admin' && pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          } else if (role === 'counselor' && pathname !== '/counselor/login') {
            window.location.href = '/counselor/login';
          } else if (role === 'client' && pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
