/**
 * apiClient.js
 * Axios instance pre-configured for the NexusVault API Gateway.
 *
 * - Base URL points at the FastAPI gateway (port 8000)
 * - Request interceptor injects Bearer token from localStorage
 * - Response interceptor handles 401 → auto logout
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nv_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ─────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and reload to login
      localStorage.removeItem('nv_token');
      localStorage.removeItem('nv_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ── Convenience API methods ───────────────────────────────────────────────────

export const authApi = {
  login:    (data) => apiClient.post('/api/auth/login', data),
  register: (data) => apiClient.post('/api/auth/register', data),
};

export const itemsApi = {
  getAll:  ()           => apiClient.get('/api/items'),
  getById: (id)         => apiClient.get(`/api/items/${id}`),
  create:  (data)       => apiClient.post('/api/items', data),
  update:  (id, data)   => apiClient.put(`/api/items/${id}`, data),
  remove:  (id)         => apiClient.delete(`/api/items/${id}`),
};

export const auditApi = {
  getLog: (page = 0, size = 20) =>
    apiClient.get('/api/audit', { params: { page, size } }),
};
