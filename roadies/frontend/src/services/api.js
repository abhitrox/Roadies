import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('roadies_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  signup: (email, password, name) => apiClient.post('/auth/signup', { email, password, name }),
  logout: () => apiClient.post('/auth/logout'),
};

export const ridesAPI = {
  getNearby: () => apiClient.get('/rides/nearby'),
  getFiltered: (type) => apiClient.get(`/rides/filtered/${type}`),
  select: (id) => apiClient.post(`/rides/select/${id}`),
};

export const faresAPI = {
  calculate: (app, type, distance, hour) => 
    apiClient.get('/fares/calculate', {
      params: { app, type, distance, hour }
    }),
  getSurge: (hour) => apiClient.get(`/fares/surge/${hour}`),
};

export default apiClient;