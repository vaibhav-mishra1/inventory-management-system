import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../services/categoryService.js';
import { createItem, deleteItem, fetchItems, updateItem } from '../services/itemService.js';
import { stockIn, stockOut } from '../services/inventoryService.js';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/ToastContext.jsx';

// Align with backend ItemCreate / ItemResponse fields
const emptyForm = {
  name: '',
  category_id: '',
  stock: '',
  price_per_unit: ''
};

const Items = () => {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [stockModalType, setStockModalType] = useState(null); // 'in' or 'out'
  const [stockItem, setStockItem] = useState(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockSaving, setStockSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        fetchItems(),
        fetchCategories()
      ]);
      setItems(itemsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to load items';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Item name is required';
    if (!form.category_id) newErrors.category_id = 'Category is required';
    if (form.stock === '') newErrors.stock = 'Stock is required';
    if (form.price_per_unit === '') newErrors.price_per_unit = 'Price per unit is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category_id: item.category_id,
      stock: item.stock,
      price_per_unit: item.price_per_unit
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name,
      category_id: Number(form.category_id),
      stock: Number(form.stock),
      price_per_unit: Number(form.price_per_unit)
    };
    try {
      setSaving(true);
      if (editingId) {
        await updateItem(editingId, {
          name: payload.name,
          price_per_unit: payload.price_per_unit
        });
        addToast('Item updated', 'success');
      } else {
        await createItem(payload);
        addToast('Item created', 'success');
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (error) {
      const message =
        error.response?.data?.detail || error.response?.data?.message || 'Failed to save item';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteItem(deleteId);
      addToast('Item deleted', 'success');
      setDeleteId(null);
      await loadData();
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to delete item';
      addToast(message, 'error');
    }
  };

  const openStockModal = (type, item) => {
    setStockModalType(type);
    setStockItem(item);
    setStockQuantity('');
  };

  const handleStockAction = async () => {
    if (!stockItem) return;
    const qty = Number(stockQuantity);
    if (!qty || qty <= 0) {
      addToast('Please enter a valid quantity', 'error');
      return;
    }

    if (stockModalType === 'out' && qty > stockItem.stock) {
      addToast('Cannot stock-out more than available stock', 'error');
      return;
    }

    try {
      setStockSaving(true);
      const payload = { item_id: stockItem.id, quantity: qty };
      if (stockModalType === 'in') {
        await stockIn(payload);
        addToast('Stock increased successfully', 'success');
      } else {
        await stockOut(payload);
        addToast('Stock reduced successfully', 'success');
      }
      setStockModalType(null);
      setStockItem(null);
      await loadData();
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Stock update failed';
      addToast(message, 'error');
    } finally {
      setStockSaving(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : '-';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Items</h2>
          <p className="page-description">
            Manage individual items, prices, and perform quick stock in/out actions.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={startAdd}>
            {editingId ? 'Cancel Edit' : 'Add Item'}
          </button>
        </div>
      </div>

      <section className="section card">
        <h3 className="section-title">{editingId ? 'Edit Item' : 'New Item'}</h3>
        <form className="grid grid-3" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Item Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="select"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="error-text">{errors.category_id}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="stock">Initial Stock</label>
            <input
              id="stock"
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="input"
            />
            {errors.stock && <p className="error-text">{errors.stock}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="price_per_unit">Price per Unit</label>
            <input
              id="price_per_unit"
              name="price_per_unit"
              type="number"
              value={form.price_per_unit}
              onChange={handleChange}
              className="input"
            />
            {errors.price_per_unit && <p className="error-text">{errors.price_per_unit}</p>}
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </section>

      <section className="section">
        <div className="card">
          <h3 className="section-title">All Items</h3>
          {loading && <Loader />}
          {!loading && items.length === 0 && (
            <div className="empty-state">No items found. Add an item using the form above.</div>
          )}
          {!loading && items.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Price per Unit</th>
                    <th>Total Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{getCategoryName(item.category_id)}</td>
                      <td>{item.stock}</td>
                      <td>₹{Number(item.price_per_unit).toLocaleString()}</td>
                      <td>
                        ₹{Number(item.stock * item.price_per_unit || 0).toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => openStockModal('in', item)}
                          style={{ marginRight: '0.3rem' }}
                        >
                          Stock In
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => openStockModal('out', item)}
                          style={{ marginRight: '0.3rem' }}
                        >
                          Stock Out
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => startEdit(item)}
                          style={{ marginRight: '0.3rem', marginTop: '0.3rem' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => setDeleteId(item.id)}
                          style={{ marginTop: '0.3rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Modal
        title={stockModalType === 'in' ? 'Stock In' : 'Stock Out'}
        isOpen={Boolean(stockModalType)}
        onClose={() => {
          setStockModalType(null);
          setStockItem(null);
        }}
      >
        {stockItem && (
          <>
            <p>
              <strong>{stockItem.name}</strong> (Current stock: {stockItem.stock})
            </p>
            {stockModalType === 'out' && (
              <p className="error-text" style={{ marginTop: '0.3rem' }}>
                Make sure the quantity does not exceed the available stock.
              </p>
            )}
            <div className="form-group" style={{ marginTop: '0.7rem' }}>
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                className="input"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setStockModalType(null);
                  setStockItem(null);
                }}
              >
                Cancel
              </button>
              <button className="btn" onClick={handleStockAction} disabled={stockSaving}>
                {stockSaving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        title="Delete Item"
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
      >
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={confirmDelete}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Items;

