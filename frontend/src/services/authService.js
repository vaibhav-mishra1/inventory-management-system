import api from '../api/axiosInstance.js';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  const { access_token, refresh_token } = response.data;
  if (access_token) localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  return response.data;
};

/**
 * Call /auth/refresh with stored refresh_token; update stored access + refresh.
 * Returns new access_token or null on failure.
 */
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;
  try {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    const { access_token, refresh_token: newRefresh } = response.data;
    if (access_token) localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    if (newRefresh) localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
    return access_token;
  } catch {
    return null;
  }
};

export const logout = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch {
      // Ignore; clear local state anyway
    }
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

