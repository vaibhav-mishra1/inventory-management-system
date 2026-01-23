import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

// Simple helper to check if JWT is expired.
// If the token is not a well-formed JWT (no 3 parts), we treat it as
// a non-expiring opaque token and let the backend enforce auth.
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      // Not a JWT (e.g. simple session token) -> don't expire on client.
      return false;
    }
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    const now = Date.now() / 1000;
    return payload.exp < now;
  } catch (e) {
    return true;
  }
};

const api = axios.create({
  baseURL: BASE_URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && isTokenExpired(token)) {
      // Token expired, clear it
      localStorage.removeItem('access_token');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout on 401
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

