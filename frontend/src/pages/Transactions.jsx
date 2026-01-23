import React, { useEffect, useState } from 'react';
import { fetchTransactions } from '../services/inventoryService.js';
import Loader from '../components/Loader.jsx';
import { useToast } from '../components/ToastContext.jsx';

const Transactions = () => {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions();
      setTransactions(data || []);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to load transactions';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory Transactions</h2>
          <p className="page-description">
            History of all stock-in and stock-out movements in your system.
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
          {!loading && transactions.length === 0 && (
            <div className="empty-state">No transactions recorded yet.</div>
          )}
          {!loading && transactions.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id || `${tx.item_id}-${tx.timestamp}`}>
                      <td>{tx.id ?? '-'}</td>
                      <td>{tx.item_name ?? '-'}</td>
                      <td>{tx.category_name ?? '-'}</td>
                      <td>
                        <span
                          className={`badge ${
                            tx.transaction_type === 'IN' ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td>{tx.quantity}</td>
                      <td>{formatDate(tx.timestamp)}</td>
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

export default Transactions;

