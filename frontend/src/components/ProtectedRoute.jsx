import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/authService.js';

// Simple token presence check; expiry is handled in axios interceptor
const ProtectedRoute = ({ children }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;

