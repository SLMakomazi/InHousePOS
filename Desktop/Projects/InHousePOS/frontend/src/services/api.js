import axios from 'axios';

// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          throw new Error('Access denied');
        case 404:
          throw new Error('Resource not found');
        case 429:
          throw new Error('Too many requests. Please try again later.');
        default:
          throw error;
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('Request failed. Please try again.');
    }
  }
);

// Export helper methods
export const get = async (url, config = {}) => {
  const response = await api.get(url, config);
  return response.data;
};

export const post = async (url, data, config = {}) => {
  const response = await api.post(url, data, config);
  return response.data;
};

export const put = async (url, data, config = {}) => {
  const response = await api.put(url, data, config);
  return response.data;
};

export const del = async (url, config = {}) => {
  const response = await api.delete(url, config);
  return response.data;
};

export const download = async (url, config = {}) => {
  const response = await api.get(url, {
    ...config,
    responseType: 'blob'
  });
  return response.data;
};

export default api;