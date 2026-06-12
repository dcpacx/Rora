import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const CartContext = createContext(null);

const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => load('os_cart', []));
  const [rules, setRules] = useState({ deliveryFee: 60, freeDeliveryAbove: 500 });
  useEffect(() => { localStorage.setItem('os_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/settings/site');
        setRules({ deliveryFee: data.deliveryFee ?? 60, freeDeliveryAbove: data.freeDeliveryAbove ?? 500 });
      } catch (_) {}
    })();
  }, []);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const exist = prev.find((p) => p.id === product.id);
      if (exist) return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { id: product.id, slug: product.slug, name: product.name, image: product.image, price: product.price, oldPrice: product.oldPrice, unit: product.unit, qty }];
    });
  };
  const updateQty = (id, qty) => setCart((p) => p.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  const removeFromCart = (id) => setCart((p) => p.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const delivery = useMemo(() => (subtotal > 0 && subtotal < rules.freeDeliveryAbove ? rules.deliveryFee : 0), [subtotal, rules]);
  const total = subtotal + delivery;

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, cartCount, subtotal, delivery, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
