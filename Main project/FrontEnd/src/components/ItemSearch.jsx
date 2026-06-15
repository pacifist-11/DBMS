import React, { useState } from 'react';
import { Search, Brain } from 'lucide-react';

const ItemSearch = ({ items = [] }) => {
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched]   = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setSearched(true);
    setTimeout(() => {
      const q = query.toLowerCase();
      setResults(items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      ));
      setIsSearching(false);
    }, 400);
  };

  return (
    <div className="glass-panel" style={{ padding: '3rem 2rem', minHeight: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-lg)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <Brain size={30} color="var(--accent-primary)" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>Item Search</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Search inventory by name, category, SKU ID or description.
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '660px', marginBottom: '2rem' }}>
        <div className="search-container" style={{ display: 'flex', gap: '0.75rem', margin: 0 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search className="search-icon" size={20} />
            <input
              id="item-search-input"
              type="text"
              className="search-input"
              style={{ padding: '0.9rem 1rem 0.9rem 3rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
              placeholder="e.g. 'Switch' or 'SKU-1001'"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button id="item-search-btn" type="submit" className="btn btn-primary" style={{ padding: '0 1.75rem', borderRadius: 'var(--radius-md)' }}>
            {isSearching ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      <div className="animate-fade-in" style={{ maxWidth: '660px', width: '100%' }}>
        {searched && !isSearching && results.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
            No items matched "<strong>{query}</strong>".
          </div>
        )}
        {results.map(item => (
          <div key={item.id} style={{ borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', background: 'var(--bg-tertiary)', marginBottom: '0.85rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>{item.name}</h3>
                <span className={`badge ${item.status === 'healthy' ? 'success' : item.status === 'low' ? 'warning' : 'danger'}`}>{item.status}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontFamily: 'monospace' }}>{item.id}</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{item.description || 'No description.'}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)' }}>
                ₹{parseFloat(item.price || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{item.category}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Stock: {item.stock}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemSearch;
