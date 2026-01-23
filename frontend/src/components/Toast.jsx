import React from 'react';
import '../styles/toast.css';

const Toast = ({ message, type }) => {
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
    </div>
  );
};

export default Toast;

