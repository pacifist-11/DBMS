import React, { useState } from 'react';
import { Search, Plus, Trash2, Pencil, X, Loader, AlertCircle, ShieldOff } from 'lucide-react';

const InventoryList = ({ items = [], loading, error, isAdmin, onAdd, onDelete, onUpdate }) => {
  const [searchTerm, setSearchTerm]   = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editItem, setEditItem]       = useState(null);   // null = add mode, item = edit mode
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState(null);

  const blankForm = { id: '', name: '', category: '', location: '', stock: 0, minThreshold: 5, price: 0, description: '' };
  const [formData, setFormData] = useState(blankForm);

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => { setEditItem(null); setFormData(blankForm); setFormError(null); setShowForm(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setFormData({ id: item.id, name: item.name, category: item.category, location: item.location || '',
      stock: item.stock, minThreshold: item.minThreshold, price: item.price, description: item.description || '' });
    setFormError(null);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditItem(null); setFormData(blankForm); setFormError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editItem) {
        await onUpdate({ ...formData, stock: Number(formData.stock), minThreshold: Number(formData.minThreshold), price: Number(formData.price) });
      } else {
        await onAdd({ ...formData, stock: Number(formData.stock), minThreshold: Number(formData.minThreshold), price: Number(formData.price) });
      }
      closeForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete item ${id}? This cannot be undone.`)) return;
    try { await onDelete(id); } catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem', color: 'var(--text-secondary)' }}>
      <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} /> Loading items…
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--danger-text)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <AlertCircle size={18} /> {error}
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-container" style={{ margin: 0, maxWidth: '380px', flex: 1 }}>
          <Search className="search-icon" size={20} />
          <input type="text" className="search-input" placeholder="Search by name, SKU or category…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openAdd} id="add-item-btn">
            <Plus size={18} /> Add New Item
          </button>
        )}
        {!isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            <ShieldOff size={15} /> Read-only (USER role)
          </div>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-tertiary)', padding: '1.75rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>{editItem ? `Edit — ${editItem.id}` : 'Add New Item'}</h3>
            <button type="button" onClick={closeForm} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          {formError && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-sm)', color: 'var(--danger-text)', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: '1fr 1fr' }}>
            {!editItem && (
              <input required placeholder="SKU ID (e.g. SKU-1007)" className="search-input" value={formData.id}
                onChange={e => setFormData({ ...formData, id: e.target.value })} style={{ gridColumn: 'span 2' }} />
            )}
            <input required placeholder="Product Name" className="search-input" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <input required placeholder="Category" className="search-input" value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })} />
            <input placeholder="Location" className="search-input" value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })} />
            <input placeholder="Description" className="search-input" value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ minWidth: '70px', fontSize: '0.88rem', fontWeight: 500 }}>Stock:</label>
              <input required type="number" min="0" className="search-input" value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ minWidth: '70px', fontSize: '0.88rem', fontWeight: 500 }}>Min Threshold:</label>
              <input required type="number" min="0" className="search-input" value={formData.minThreshold}
                onChange={e => setFormData({ ...formData, minThreshold: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', gridColumn: 'span 2' }}>
              <label style={{ minWidth: '70px', fontSize: '0.88rem', fontWeight: 500 }}>Price (₹):</label>
              <input required type="number" min="0" step="0.01" className="search-input" value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}
            style={{ marginTop: '1.25rem', width: '100%', opacity: submitting ? 0.75 : 1 }}>
            {submitting ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : (editItem ? 'Save Changes' : 'Save Item to Database')}
          </button>
        </form>
      )}

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Stock / Min</th>
              <th>Price</th>
              <th>Status</th>
              {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{item.id}</td>
                <td style={{ fontWeight: '600' }}>{item.name}</td>
                <td><span style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>{item.category}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{item.location || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: '600' }}>{item.stock}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ {item.minThreshold}</span>
                  </div>
                </td>
                <td style={{ fontWeight: '600' }}>₹{parseFloat(item.price || 0).toLocaleString('en-IN')}</td>
                <td>
                  <span className={`badge ${item.status === 'healthy' ? 'success' : item.status === 'low' ? 'warning' : 'danger'}`}>
                    {item.status}
                  </span>
                </td>
                {isAdmin && (
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.35rem', color: 'var(--accent-primary)' }}
                        onClick={() => openEdit(item)} title="Edit item">
                        <Pencil size={15} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.35rem', color: 'var(--danger-text)' }}
                        onClick={() => handleDelete(item.id)} title="Delete item">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-tertiary)', borderRadius: '0 0 var(--radius-md) var(--radius-md)', color: 'var(--text-secondary)' }}>
            {searchTerm ? `No items match "${searchTerm}"` : 'No items in inventory yet.'}
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
        Showing {filtered.length} of {items.length} items
      </div>
    </div>
  );
};

export default InventoryList;
