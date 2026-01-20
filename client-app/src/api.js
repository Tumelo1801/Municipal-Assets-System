import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5242/api', // Your backend API URL
});

export default api;