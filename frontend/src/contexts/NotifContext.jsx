import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const NotifContext = createContext(null);

export const NotifProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setUnread(0); return; }
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setItems(list.data);
      setUnread(count.data.count);
    } catch (_) {} finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [user, refresh]);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
    try { await api.post(`/notifications/${id}/read`); } catch (_) {}
  };
  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try { await api.post('/notifications/read-all'); } catch (_) {}
  };

  return (
    <NotifContext.Provider value={{ items, unread, loading, refresh, markRead, markAllRead }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotifications must be used within NotifProvider');
  return ctx;
};
