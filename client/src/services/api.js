import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  verifyToken: () => apiClient.get('/auth/verify'),
};

// Spaces API
export const spacesAPI = {
  getAll: () => apiClient.get('/espacos'),
  getById: (id) => apiClient.get(`/espacos/${id}`),
  create: (data) => apiClient.post('/espacos', data),
  update: (id, data) => apiClient.put(`/espacos/${id}`, data),
  delete: (id) => apiClient.delete(`/espacos/${id}`),
};

// Amenities API
export const amenitiesAPI = {
  getAll: () => apiClient.get('/amenities'),
  getById: (id) => apiClient.get(`/amenities/${id}`),
  create: (data) => apiClient.post('/amenities', data),
  update: (id, data) => apiClient.put(`/amenities/${id}`, data),
  delete: (id) => apiClient.delete(`/amenities/${id}`),
};

// Reservations API
export const reservationsAPI = {
  getAll: () => apiClient.get('/reservas'),
  getById: (id) => apiClient.get(`/reservas/${id}`),
  getMy: () => apiClient.get('/reservas/minhas'),
  create: (data) => apiClient.post('/reservas', data),
  update: (id, data) => apiClient.put(`/reservas/${id}`, data),
  delete: (id) => apiClient.delete(`/reservas/${id}`),
  approve: (id) => apiClient.patch(`/reservas/${id}/aprovar`),
  reject: (id) => apiClient.patch(`/reservas/${id}/rejeitar`),
};

// Users API
export const usersAPI = {
  getAll: () => apiClient.get('/usuarios'),
  getById: (id) => apiClient.get(`/usuarios/${id}`),
  create: (data) => apiClient.post('/usuarios', data),
  update: (id, data) => apiClient.put(`/usuarios/${id}`, data),
  delete: (id) => apiClient.delete(`/usuarios/${id}`),
};

// Logs API
export const logsAPI = {
  getAll: () => apiClient.get('/logs'),
  getById: (id) => apiClient.get(`/logs/${id}`),
  create: (data) => apiClient.post('/logs', data),
  delete: (id) => apiClient.delete(`/logs/${id}`),
};

// Space-Amenities API
export const spaceAmenitiesAPI = {
  getAll: () => apiClient.get('/espaco-amenities'),
  getBySpaceId: (spaceId) => apiClient.get(`/espaco-amenities/espaco/${spaceId}`),
  create: (data) => apiClient.post('/espaco-amenities', data),
  delete: (spaceId, amenityId) => apiClient.delete(`/espaco-amenities/${spaceId}/${amenityId}`),
};

export default apiClient;