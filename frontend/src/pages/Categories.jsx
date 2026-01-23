import React, { useEffect, useState } from 'react';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory
} from '../services/categoryService.js';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/ToastContext.jsx';

// Backend CategoryCreate / CategoryUpdate only need `name`
const emptyForm = {
  name: ''
};

const Categories = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data || []);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to load categories';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      if (editingId) {
        await updateCategory(editingId, { name: form.name });
        addToast('Category updated', 'success');
      } else {
        await createCategory({ name: form.name });
        addToast('Category created', 'success');
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadCategories();
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to save category';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      addToast('Category deleted', 'success');
      setDeleteId(null);
      await loadCategories();
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to delete category';
      addToast(message, 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Categories</h2>
          <p className="page-description">
            Create high-level groups. Stock and total value are calculated from items.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={loadCategories}>
            View Categories
          </button>
          <button className="btn" onClick={startAdd}>
            {editingId ? 'Cancel Edit' : 'Add Category'}
          </button>
        </div>
      </div>

      <section className="section card">
        <h3 className="section-title">{editingId ? 'Edit Category' : 'New Category'}</h3>
        <form className="grid grid-3" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Category Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="e.g. Electronics, Stationery"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </section>

      <section className="section">
        <div className="card">
          <h3 className="section-title">All Categories</h3>
          {loading && <Loader />}
          {!loading && categories.length === 0 && (
            <div className="empty-state">
              No categories found. Create one using the form above, then click &quot;View
              Categories&quot;.
            </div>
          )}
          {!loading && categories.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Total Stock</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.id}</td>
                      <td>{cat.name}</td>
                      <td>{cat.total_stock}</td>
                      <td>₹{Number(cat.total_amount).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => startEdit(cat)}
                          style={{ marginRight: '0.4rem' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => setDeleteId(cat.id)}
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
        title="Delete Category"
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
      >
        <p>Are you sure you want to delete this category? This action cannot be undone.</p>
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

export default Categories;

