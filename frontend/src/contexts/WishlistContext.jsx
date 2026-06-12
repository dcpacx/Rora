import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) { setIds([]); return; }
    try {
      const { data } = await api.get('/auth/me/wishlist');
      setIds((data || []).map((p) => p.id));
    } catch (_) { setIds([]); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const inWishlist = (productId) => ids.includes(productId);

  const toggle = async (productId) => {
    if (!user) return { needsLogin: true };
    // optimistic
    setIds((prev) => prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId]);
    try {
      const { data } = await api.post(`/auth/me/wishlist/${productId}`);
      return { inWishlist: data.inWishlist };
    } catch (_) {
      // revert on error
      setIds((prev) => prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId]);
      return { error: true };
    }
  };

  return (
    <WishlistContext.Provider value={{ ids, inWishlist, toggle, refresh, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
