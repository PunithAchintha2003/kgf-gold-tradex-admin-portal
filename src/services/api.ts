import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTH_PUBLIC_PATHS = ['/login', '/forgot-password'];

const isPublicAuthPath = () => {
  if (typeof window === 'undefined') return false;
  return AUTH_PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      const headers = config.headers;
      if (headers && typeof headers.delete === 'function') {
        headers.delete('Content-Type');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (!isPublicAuthPath()) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

