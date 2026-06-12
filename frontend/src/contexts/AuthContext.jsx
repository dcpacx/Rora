import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('os_token'));
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (_) {
      localStorage.removeItem('os_token');
      setToken(null);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const handleAuth = (data) => {
    localStorage.setItem('os_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return handleAuth(data);
  };
  const signup = async (name, email, phone, password) => {
    const { data } = await api.post('/auth/signup', { name, email, phone, password });
    return handleAuth(data);
  };
  const logout = () => {
    localStorage.removeItem('os_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
