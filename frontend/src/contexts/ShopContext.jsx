import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ShopContext = createContext(null);

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
};

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState(() => load('evaly_cart', []));
  const [wishlist, setWishlist] = useState(() => load('evaly_wishlist', []));

  useEffect(() => { localStorage.setItem('evaly_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('evaly_wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const exist = prev.find((p) => p.id === product.id);
      if (exist) return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { ...product, qty }];
    });
  };
  const updateQty = (id, qty) => setCart((p) => p.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const removeFromCart = (id) => setCart((p) => p.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => (prev.find((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]));
  };
  const isWishlisted = (id) => !!wishlist.find((p) => p.id === id);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const value = { cart, wishlist, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, isWishlisted, cartCount, cartTotal };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
};
