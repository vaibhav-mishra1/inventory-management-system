import React, { useEffect, useState } from 'react';
import { fetchLowStock } from '../services/inventoryService.js';
import Loader from '../components/Loader.jsx';
import { useToast } from '../components/ToastContext.jsx';

const LowStock = () => {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchLowStock();
      setItems(data || []);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to load low stock items';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Low Stock Alerts</h2>
          <p className="page-description">
            Items that are running low and should be reordered soon.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      <section className="section">
        <div className="card">
          {loading && <Loader />}
          {!loading && items.length === 0 && (
            <div className="empty-state">
              Great news! There are currently no low stock items.
            </div>
          )}
          {!loading && items.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Suggested Reorder Qty</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ backgroundColor: 'rgba(127,29,29,0.3)' }}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.category_name ?? '-'}</td>
                      <td>{item.stock}</td>
                      <td>
                        {item.suggested_reorder_quantity ?? (item.stock * 2 || 10)}
                      </td>
                      <td>
                        <span className="badge badge-danger">Reorder soon</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LowStock;

