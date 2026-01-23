import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService.js';
import '../styles/sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>IMS</h2>
        <p>Inventory Management</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className="nav-link">
          Dashboard
        </NavLink>
        <NavLink to="/categories" className="nav-link">
          Categories
        </NavLink>
        <NavLink to="/items" className="nav-link">
          Items
        </NavLink>
        <NavLink to="/transactions" className="nav-link">
          Transactions
        </NavLink>
        <NavLink to="/low-stock" className="nav-link">
          Low Stock Alerts
        </NavLink>
      </nav>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;

