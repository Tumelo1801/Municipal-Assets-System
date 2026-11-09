
import axios from 'axios';
import API_BASE from '../config';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT to requests when an administrator is logged in.
api.interceptors.request.use(
  (config) => {
    const storedAdmin = localStorage.getItem('admin');

    if (storedAdmin) {
      try {
        const admin = JSON.parse(storedAdmin);

        if (admin.token) {
          config.headers.Authorization = `Bearer ${admin.token}`;
        }
      } catch (error) {
        console.error('Unable to read administrator session:', error);
        localStorage.removeItem('admin');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
