/**
 * LoginPage.jsx
 * Handles login and register in a single animated page.
 * Uses AuthContext to authenticate against the API gateway.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Package, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register, error, clearError } = useAuth();

  const [mode, setMode]           = useState('login');   // 'login' | 'register'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [username, setUsername]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const cardRef = useRef(null);
  const formRef = useRef(null);

  // Entry animation
  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  // Animate form flip when toggling mode
  useEffect(() => {
    clearError();
    gsap.fromTo(formRef.current,
      { opacity: 0, x: mode === 'login' ? -20 : 20 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [mode]);

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      await login(email, password);
    } else {
      await register(username, email, password);
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* Animated background blobs */}
      <div style={{ ...styles.blob, top: '10%', left: '15%', background: 'rgba(99,102,241,0.25)' }} />
      <div style={{ ...styles.blob, top: '60%', right: '10%', background: 'rgba(16,185,129,0.2)', animationDelay: '-3s' }} />
      <div style={{ ...styles.blob, bottom: '5%', left: '40%', background: 'rgba(245,158,11,0.15)', animationDelay: '-6s' }} />

      <div ref={cardRef} style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoWrap}>
            <Package size={28} color="white" />
          </div>
          <h1 style={styles.title}>Inventory</h1>
          <p style={styles.subtitle}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Username</label>
              <div style={styles.inputWrap}>
                <User size={16} style={styles.inputIcon} />
                <input
                  id="login-username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                id="login-email"
                type="email"
                placeholder="admin@nexusvault.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ ...styles.input, paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                {mode === 'login' ? 'Signing in…' : 'Creating account…'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={styles.toggleText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            id="toggle-auth-mode"
            type="button"
            onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
            style={styles.toggleBtn}
          >
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>

        {/* Quick-fill hint */}
        {mode === 'login' && (
          <div style={styles.hint}>
            <strong>Demo credentials</strong> <span style={{ fontWeight: 400, color: '#818cf8' }}>(click to fill)</span><br />
            <button
              type="button"
              onClick={() => fillDemo('admin@nexusvault.io', 'Admin@123')}
              style={styles.demoBtn}
            >
              👑 Admin: admin@nexusvault.io
            </button>
            <button
              type="button"
              onClick={() => fillDemo('warehouse@nexusvault.io', 'Admin@123')}
              style={styles.demoBtn}
            >
              📦 User: warehouse@nexusvault.io
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

// ── Inline styles (dark glass card) ──────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0b0f19 0%, #111827 50%, #0f1723 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Outfit', sans-serif",
  },
  blob: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'float 12s ease-in-out infinite',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.75rem',
  },
  logoWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
  },
  title: {
    color: '#f3f4f6',
    fontSize: '1.6rem',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    marginTop: '0.35rem',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: '#fca5a5',
    fontSize: '0.875rem',
    marginBottom: '1.25rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    color: '#d1d5db',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.85rem',
    color: '#6b7280',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '0.75rem 0.9rem 0.75rem 2.5rem',
    color: '#f3f4f6',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.85rem',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
  },
  submitBtn: {
    marginTop: '0.5rem',
    padding: '0.85rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
  },
  toggleText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '0.875rem',
    marginTop: '1.25rem',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#818cf8',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: 0,
  },
  hint: {
    marginTop: '1rem',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: '#a5b4fc',
    fontSize: '0.8rem',
    lineHeight: 1.6,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  demoBtn: {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px',
    color: '#c7d2fe',
    fontSize: '0.78rem',
    padding: '0.4rem 0.75rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
    textAlign: 'left',
    width: '100%',
    fontFamily: 'inherit',
  },
};
