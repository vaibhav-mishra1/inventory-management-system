import api from '../api/axiosInstance.js';

export const stockIn = async (data) => {
  const response = await api.post('/inventory/stock-in', data);
  return response.data;
};

export const stockOut = async (data) => {
  const response = await api.post('/inventory/stock-out', data);
  return response.data;
};

export const fetchTransactions = async () => {
  const response = await api.get('/inventory/transactions');
  return response.data;
};

export const fetchLowStock = async () => {
  const response = await api.get('/inventory/low-stock');
  return response.data;
};

export const fetchDashboard = async () => {
  const response = await api.get('/inventory/dashboard');
  return response.data;
};

