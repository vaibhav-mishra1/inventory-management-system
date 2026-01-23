import api from '../api/axiosInstance.js';

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  const { access_token } = response.data;
  // Backend currently returns user details, not a real JWT.
  // We still store a token-like value so that the frontend's
  // protected routes and interceptors can work consistently.
  const tokenToStore =
    access_token ||
    `user-${response.data.id ?? ''}-${response.data.username ?? ''}`.trim() ||
    'logged_in';
  localStorage.setItem('access_token', tokenToStore);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
};

export const getToken = () => localStorage.getItem('access_token');

