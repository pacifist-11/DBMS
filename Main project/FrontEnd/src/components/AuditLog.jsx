import React, { useState, useEffect } from 'react';
import { ClipboardList, ChevronLeft, ChevronRight, Loader, AlertCircle } from 'lucide-react';
import { auditApi } from '../api/apiClient';

const AuditLog = () => {
  const [logs, setLogs]       = useState([]);
  const [page, setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchLogs = async (p = 0) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await auditApi.getLog(p, 15);
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(p);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(0); }, []);

  const actionColor = (action) => {
    if (action === 'INSERT') return 'success';
    if (action === 'UPDATE') return 'warning';
    if (action === 'DELETE') return 'danger';
    return '';
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return dt; }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem', color: 'var(--text-secondary)' }}>
      <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} /> Loading audit log…
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
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <ClipboardList size={20} color="var(--accent-primary)" /> Audit Log
        </h2>
        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Immutable trail of all data changes</span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Action</th>
              <th>Table</th>
              <th>Record ID</th>
              <th>Performed By</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={log.id}>
                <td style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>{log.id}</td>
                <td><span className={`badge ${actionColor(log.action)}`}>{log.action}</span></td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.tableName}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--accent-primary)' }}>{log.recordId}</td>
                <td style={{ fontSize: '0.88rem' }}>{log.performedBy?.username || '—'}</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{formatDate(log.performedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            No audit records found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }} onClick={() => fetchLogs(page - 1)} disabled={page === 0}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }} onClick={() => fetchLogs(page + 1)} disabled={page >= totalPages - 1}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
