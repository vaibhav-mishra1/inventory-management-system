import React, { useEffect, useState } from 'react';
import { fetchDashboard } from '../services/inventoryService.js';
import Loader from '../components/Loader.jsx';
import { useToast } from '../components/ToastContext.jsx';

const Dashboard = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDashboard();
        setStats(data);
      } catch (error) {
        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Failed to load dashboard data';
        addToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-description">
            Overview of your inventory, stock levels, and total value.
          </p>
        </div>
      </div>

      {loading && <Loader />}

      {!loading && !stats && <div className="empty-state">No dashboard data available.</div>}

      {!loading && stats && (
        <div className="grid grid-3">
          <div className="card">
            <div className="card-title">Total Categories</div>
            <div className="card-value">{stats.total_categories ?? 0}</div>
            <div className="card-subtext">Distinct groups of items</div>
          </div>
          <div className="card">
            <div className="card-title">Total Items</div>
            <div className="card-value">{stats.total_items ?? 0}</div>
            <div className="card-subtext">Individual products being tracked</div>
          </div>
          <div className="card">
            <div className="card-title">Total Stock</div>
            <div className="card-value">{stats.total_stock ?? 0}</div>
            <div className="card-subtext">Current quantity across all items</div>
          </div>
          <div className="card">
            <div className="card-title">Inventory Value</div>
            <div className="card-value">
              ₹{Number(stats.total_inventory_value ?? stats.total_amount ?? 0).toLocaleString()}
            </div>
            <div className="card-subtext">Total value of all stock</div>
          </div>
          <div className="card">
            <div className="card-title">Low Stock Items</div>
            <div className="card-value">{stats.low_stock_count ?? 0}</div>
            <div className="card-subtext">Items that need attention soon</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

