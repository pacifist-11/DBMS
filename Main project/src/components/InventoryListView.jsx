import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';

const InventoryListView = ({ items, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Simple form state
  const [formData, setFormData] = useState({
    id: '', name: '', category: '', location: '', stock: 0, minThreshold: 5, status: 'healthy', price: 0
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      stock: Number(formData.stock),
      minThreshold: Number(formData.minThreshold),
      price: Number(formData.price || 0),
      status: Number(formData.stock) <= Number(formData.minThreshold) ? 'critical' : 'healthy'
    });
    setShowAddForm(false);
    setFormData({ id: '', name: '', category: '', location: '', stock: 0, minThreshold: 5, status: 'healthy', price: 0 });
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="search-container" style={{ margin: 0, maxWidth: '400px' }}>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search SKUs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} />
          {showAddForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <input required placeholder="SKU ID (e.g. SKU-1001)" className="search-input" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} />
          <input required placeholder="Product Name" className="search-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Category" className="search-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          <input required placeholder="Location" className="search-input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ minWidth: '80px', fontWeight: '500' }}>Stock:</label>
            <input required type="number" className="search-input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ minWidth: '80px', fontWeight: '500' }}>Price (₹):</label>
            <input required type="number" min="0" className="search-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Save Item to Database</button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{item.id}</td>
                <td style={{ fontWeight: '600' }}>{item.name}</td>
                <td><span style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>{item.category}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontWeight: '600' }}>{item.stock}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/ {item.minThreshold} min</div>
                  </div>
                </td>
                <td style={{ fontWeight: '600' }}>₹{(item.price || 0).toLocaleString('en-IN')}</td>
                <td>
                  <span className={`badge ${item.status === 'healthy' ? 'success' : item.status === 'low' ? 'warning' : 'danger'}`}>
                    {item.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger-text)' }} onClick={() => onDelete(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-tertiary)' }}>
            No SKUs found. Try adding one!
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryListView;
