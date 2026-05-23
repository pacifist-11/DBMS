import React, { useState, useEffect } from 'react';
import { Package, LayoutDashboard, Search, Bell, Settings, LogOut, Sun, Moon } from 'lucide-react';
import gsap from 'gsap';
import DashboardView from './components/DashboardView';
import SemanticSearchView from './components/SemanticSearchView';
import InventoryListView from './components/InventoryListView';
import { initialItems } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const isDark = theme === 'dark';
    localStorage.setItem('theme', theme);
    
    // Animate CSS variables on :root with GSAP for smooth color shifts
    gsap.to(':root', {
      '--bg-primary': isDark ? '#0b0f19' : '#f8fafc',
      '--bg-secondary': isDark ? '#111827' : '#ffffff',
      '--bg-tertiary': isDark ? '#1f2937' : '#f1f5f9',
      '--text-primary': isDark ? '#f3f4f6' : '#0f172a',
      '--text-secondary': isDark ? '#9ca3af' : '#64748b',
      '--text-tertiary': isDark ? '#6b7280' : '#94a3b8',
      '--border-color': isDark ? '#374151' : '#e2e8f0',
      '--accent-light': isDark ? 'rgba(37, 99, 235, 0.12)' : '#eff6ff',
      '--success-bg': isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
      '--success-text': isDark ? '#34d399' : '#065f46',
      '--warning-bg': isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
      '--warning-text': isDark ? '#fbbf24' : '#92400e',
      '--danger-bg': isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
      '--danger-text': isDark ? '#fca5a5' : '#991b1b',
      duration: 0.45,
      ease: 'power2.out'
    });

    // Spin/fade in the new icon dynamically
    gsap.fromTo('.theme-icon', 
      { rotation: -90, scale: 0.5, opacity: 0 },
      { rotation: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' }
    );
  }, [theme]);

  // =========================================================================
  // BACKEND INTEGRATION POINT: 
  // Right now, this uses local state. When you build your backend, you will
  // replace this with a useEffect that calls fetch('/api/items') 
  // =========================================================================
  const [items, setItems] = useState(initialItems);

  // Example of how you will fetch from backend later:
  /*
  useEffect(() => {
    fetch('http://localhost:5000/api/items')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error("Error fetching items:", err));
  }, []);
  */

  // --- CRUD Operations (Currently updates state, later will update DB) ---

  const addItem = (newItem) => {
    // TODO: Replace with: fetch('http://localhost:5000/api/items', { method: 'POST', body: JSON.stringify(newItem) })
    setItems([...items, newItem]);
  };

  const deleteItem = (id) => {
    // TODO: Replace with: fetch(`http://localhost:5000/api/items/${id}`, { method: 'DELETE' })
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (updatedItem) => {
    // TODO: Replace with: fetch(`http://localhost:5000/api/items/${updatedItem.id}`, { method: 'PUT', body: JSON.stringify(updatedItem) })
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  // -----------------------------------------------------------------------

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView items={items} />;
      case 'inventory':
        return <InventoryListView items={items} onAdd={addItem} onDelete={deleteItem} onUpdate={updateItem} />;
      case 'search':
        return <SemanticSearchView items={items} />;
      default:
        return <DashboardView items={items} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo">
          <div style={{ background: 'var(--accent-primary)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
            <Package size={22} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem' }}>NexusVault</span>
        </div>
        
        <nav className="nav-links" style={{ marginTop: '1rem' }}>
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={18} />
            <span>Inventory SKUs</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={18} />
            <span>Semantic Search</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-wrapper">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'inventory' && 'Inventory Management'}
                {activeTab === 'search' && 'AI Semantic Search'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {activeTab === 'dashboard' && 'Monitor your inventory levels and view dynamic statistics.'}
                {activeTab === 'inventory' && 'Add, Edit, and Delete physical SKUs in your database.'}
                {activeTab === 'search' && 'Simulate MongoDB Vector Search queries.'}
              </p>
            </div>

            <button 
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
              className="theme-toggle-btn"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.6rem',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                width: '40px',
                height: '40px',
              }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? <Moon size={20} className="theme-icon" /> : <Sun size={20} className="theme-icon" />}
            </button>
          </header>
          
          {/* Dynamic Render based on Active Tab */}
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
