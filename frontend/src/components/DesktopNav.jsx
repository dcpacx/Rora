import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Leaf, ShoppingBag, User, ClipboardList, LayoutGrid, Home, LogOut, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/categories', label: 'Categories', icon: LayoutGrid },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
];

const DesktopNav = () => {
  const { pathname } = useLocation();
  const { cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const active = (to, exact = false) => exact ? pathname === to : pathname === to || pathname.startsWith(to + '/');

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 grid place-items-center"><Leaf className="w-5 h-5 text-white" /></div>
          <div className="leading-tight">
            <div className="font-extrabold text-neutral-900">Sobuj <span className="font-light text-emerald-700">• সবুজ</span></div>
            <div className="text-[10px] text-neutral-500 -mt-0.5">Pure. Organic. Local.</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((it) => (
            <Link key={it.to} to={it.to} className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${active(it.to, it.exact) ? 'text-emerald-700 bg-emerald-50' : 'text-neutral-700 hover:bg-neutral-50'}`}>
              {it.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="flex-1 max-w-xl mx-auto">
          <div className="flex items-center h-11 rounded-full bg-neutral-100 border border-neutral-200 hover:border-neutral-300 focus-within:border-emerald-400 transition-colors overflow-hidden">
            <Search className="w-4 h-4 text-neutral-500 ml-4" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search honey, oil, spices…" className="flex-1 h-full bg-transparent px-3 text-sm outline-none placeholder:text-neutral-500" />
            <button type="submit" className="h-9 mr-1.5 px-4 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Search</button>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors flex items-center gap-1.5">
            <ShoppingBag className="w-5 h-5 text-neutral-700" />
            <span className="text-sm font-medium">Cart</span>
            {cartCount > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">{cartCount}</span>)}
          </Link>
          {user ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-bold">{user.name.charAt(0).toUpperCase()}</div>
                <span className="text-sm font-medium hidden xl:inline">{user.name.split(' ')[0]}</span>
              </button>
              {open && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-neutral-200 shadow-lg z-20 py-1.5">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <div className="text-sm font-semibold truncate">{user.name}</div>
                      <div className="text-[11px] text-neutral-500 truncate">{user.email}</div>
                    </div>
                    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50"><User className="w-4 h-4" /> Profile</Link>
                    <Link to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50"><ClipboardList className="w-4 h-4" /> My orders</Link>
                    {isAdmin && (<Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 text-emerald-700 font-semibold">Admin dashboard</Link>)}
                    <button onClick={() => { logout(); setOpen(false); nav('/'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600"><LogOut className="w-4 h-4" /> Logout</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="ml-1 inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 h-10 rounded-full hover:bg-emerald-700">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default DesktopNav;
