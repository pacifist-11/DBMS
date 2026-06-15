import React, { useState } from 'react';
import { Search, Sparkles, Brain } from 'lucide-react';

const SemanticSearchView = ({ items }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // =========================================================================
    // BACKEND INTEGRATION POINT: 
    // Here you will send the query to your backend, which will convert it to
    // a vector embedding and query MongoDB Atlas Vector Search.
    // e.g. fetch(`/api/search?q=${query}`)
    // =========================================================================
    
    setTimeout(() => {
      // Mocking a local search instead of vector search for now
      const q = query.toLowerCase();
      const mockResults = items.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
      
      setResults(mockResults);
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="glass-panel" style={{ padding: '3rem 2rem', minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <Brain size={32} color="var(--accent-primary)" />
          </div>
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', letterSpacing: '-0.025em' }}>AI Semantic Search</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Ready for MongoDB Vector Search integration. Currently falls back to standard text matching.
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '700px', marginBottom: '2rem' }}>
        <div className="search-container" style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              style={{ padding: '1rem 1rem 1rem 3rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
              placeholder="e.g., 'Headphones' or 'Monitor'" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', borderRadius: 'var(--radius-md)' }}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="vector-results animate-fade-in" style={{ maxWidth: '700px', width: '100%' }}>
        {results.map((result, idx) => (
          <div key={idx} className="result-card" style={{ borderRadius: 'var(--radius-md)', padding: '1.5rem', background: 'var(--bg-tertiary)', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{result.name}</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{result.category}</span>
            </div>
            <p>{result.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SemanticSearchView;
