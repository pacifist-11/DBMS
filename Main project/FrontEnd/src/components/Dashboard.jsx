import React from 'react';
import { PackageOpen, AlertTriangle, Database, Activity, Loader } from 'lucide-react';

const Dashboard = ({ items = [], loading, error }) => {
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem', color: 'var(--text-secondary)' }}>
      <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} /> Loading inventory data…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--danger-text)' }}>
      ⚠ {error}
    </div>
  );

  const totalItems    = items.length;
  const lowStock      = items.filter(i => i.status === 'low').length;
  const criticalStock = items.filter(i => i.status === 'critical').length;
  const totalValue    = '₹' + (items.reduce((acc, i) => acc + i.stock * parseFloat(i.price || 0), 0)).toLocaleString('en-IN');

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Total SKUs</span>
            <Database size={18} color="var(--accent-primary)" />
          </div>
          <div className="stat-value">{totalItems}</div>
          <div style={{ color: 'var(--success-text)', fontSize: '0.85rem', fontWeight: '500' }}>Tracking actively in DB</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Low Stock</span>
            <AlertTriangle size={18} color="var(--warning-text)" />
          </div>
          <div className="stat-value">{lowStock}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Approaching minimum threshold</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Critical Alerts</span>
            <Activity size={18} color="var(--danger-text)" />
          </div>
          <div className="stat-value">{criticalStock}</div>
          <div style={{ color: 'var(--danger-text)', fontSize: '0.85rem', fontWeight: '500' }}>Requires immediate replenishment</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Inventory Value</span>
            <PackageOpen size={18} color="var(--accent-secondary)" />
          </div>
          <div className="stat-value">{totalValue}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Estimated wholesale worth</div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="panel-header">
            <h2 style={{ marginBottom: 0 }}>Quick Status</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {items.slice(0, 5).map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{item.id} · {item.location}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: item.status === 'critical' ? 'var(--danger-text)' : item.status === 'low' ? 'var(--warning-text)' : 'var(--text-primary)' }}>
                    {item.stock}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-tertiary)' }}> / {item.minThreshold}</span>
                  </span>
                  <span className={`badge ${item.status === 'healthy' ? 'success' : item.status === 'low' ? 'warning' : 'danger'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
            {items.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No items found in database.</p>}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="panel-header">
            <h2 style={{ marginBottom: 0 }}>Category Breakdown</h2>
          </div>
          {(() => {
            const cats = {};
            items.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; });
            const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {entries.map(([cat, count]) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} SKU{count > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / totalItems) * 100}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
                {entries.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No data yet.</p>}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
