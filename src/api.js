import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ns-luxurious-bacckend-ys11.onrender.com';

const api = axios.create({
  baseURL: API_URL + '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ns-admin-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

export default api;
