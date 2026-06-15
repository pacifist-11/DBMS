/**
 * AuthContext.jsx
 * React Context providing authentication state and actions globally.
 *
 * Exports:
 *   <AuthProvider>  — wrap the app root
 *   useAuth()       — consume auth state in any component
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Rehydrate from localStorage on refresh
  const [token, setToken] = useState(() => localStorage.getItem('nv_token'));
  const [user,  setUser]  = useState(() => {
    try {
      const stored = localStorage.getItem('nv_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState(null);

  // ── Login ────────────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('nv_token', data.token);
      localStorage.setItem('nv_user',  JSON.stringify({
        username: data.username,
        email:    data.email,
        role:     data.role,
      }));
      setToken(data.token);
      setUser({ username: data.username, email: data.email, role: data.role });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
      return false;
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────

  const register = useCallback(async (username, email, password) => {
    setError(null);
    try {
      const { data } = await authApi.register({ username, email, password, role: 'USER' });
      localStorage.setItem('nv_token', data.token);
      localStorage.setItem('nv_user',  JSON.stringify({
        username: data.username,
        email:    data.email,
        role:     data.role,
      }));
      setToken(data.token);
      setUser({ username: data.username, email: data.email, role: data.role });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return false;
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    localStorage.removeItem('nv_token');
    localStorage.removeItem('nv_user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user, token, error,
      isAuthenticated, isAdmin,
      login, logout, register,
      clearError: () => setError(null),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
