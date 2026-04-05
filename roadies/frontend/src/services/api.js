import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ridesAPI = {
  getNearby: () => api.get('/rides/nearby'),
  bookRide: (data) => api.post('/rides/book', data),
  getRideDetails: (id) => api.get(`/rides/${id}`),
};

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (email, password, name) => api.post('/auth/signup', { email, password, name }),
  googleLogin: (email, name) => api.post('/auth/google', { email, name }),
};

export const faresAPI = {
  estimate: (data) => api.post('/fares/estimate', data),
  compare: (data) => api.post('/fares/compare', data),
};

export default api;