import React from 'react';
import { PackageOpen, AlertTriangle, Database, Activity } from 'lucide-react';

const DashboardView = ({ items }) => {
  // Dynamically calculate stats based on the items array
  const totalItems = items.length;
  const lowStockAlerts = items.filter(i => i.stock <= i.minThreshold + 5 && i.stock > i.minThreshold).length;
  const criticalAlerts = items.filter(i => i.stock <= i.minThreshold).length;
  
  // Dynamic value calculation in Indian Rupees (INR)
  const totalValue = "₹" + (items.reduce((acc, curr) => acc + curr.stock * (curr.price || 15000), 0)).toLocaleString('en-IN');

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
          <div style={{ color: 'var(--success-text)', fontSize: '0.85rem', fontWeight: '500' }}>
            Tracking actively in DB
          </div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Low Stock</span>
            <AlertTriangle size={18} color="var(--warning-text)" />
          </div>
          <div className="stat-value">{lowStockAlerts}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Approaching minimum threshold
          </div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Critical Alerts</span>
            <Activity size={18} color="var(--danger-text)" />
          </div>
          <div className="stat-value">{criticalAlerts}</div>
          <div style={{ color: 'var(--danger-text)', fontSize: '0.85rem', fontWeight: '500' }}>
            Requires immediate replenishment
          </div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Inventory Value</span>
            <PackageOpen size={18} color="var(--accent-secondary)" />
          </div>
          <div className="stat-value">{totalValue}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Estimated wholesale worth
          </div>
        </div>
      </div>

      {/* Main Grid Panels */}
      <div className="dashboard-grid">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="panel-header">
            <h2 style={{ marginBottom: 0 }}>Recent Inventory Logs</h2>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>(Mock logs placeholder)</div>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Action</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: 'monospace' }}>SKU-9904</td>
                  <td><span className="badge danger">Outbound</span></td>
                  <td style={{ fontWeight: '600' }}>-12</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace' }}>SKU-9901</td>
                  <td><span className="badge success">Inbound</span></td>
                  <td style={{ fontWeight: '600' }}>+50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="panel-header">
            <h2 style={{ marginBottom: 0 }}>Quick Status</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {items.slice(0, 4).map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{item.location}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '1.1rem',
                    color: item.stock <= item.minThreshold ? 'var(--danger-text)' : 'var(--text-primary)' 
                  }}>
                    {item.stock} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-tertiary)' }}>/ {item.minThreshold}</span>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No items in DB.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
