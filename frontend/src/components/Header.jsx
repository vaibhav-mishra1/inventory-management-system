import React from 'react';
import '../styles/header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div>
        <h1>Inventory Management System</h1>
        <p className="app-subtitle">College Project &mdash; FastAPI + React</p>
      </div>
    </header>
  );
};

export default Header;

