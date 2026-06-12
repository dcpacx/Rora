import React, { useEffect, useState } from 'react';
import { Link, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { api, formatBDT } from '../../lib/api';
import { LayoutDashboard, Package, ClipboardList, LogOut, Plus, ArrowUpRight, Users, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const link = ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-emerald-600 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`;
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="w-60 bg-white border-r border-neutral-200 p-4 hidden md:flex flex-col">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white grid place-items-center font-extrabold">S</div>
          <div>
            <div className="font-extrabold text-neutral-900 leading-tight">Sobuj</div>
            <div className="text-[10.5px] text-neutral-500">Admin panel</div>
          </div>
        </div>
        <nav className="space-y-1">
          <NavLink to="/admin" end className={link}><LayoutDashboard className="w-4 h-4" /> Dashboard</NavLink>
          <NavLink to="/admin/products" className={link}><Package className="w-4 h-4" /> Products</NavLink>
          <NavLink to="/admin/orders" className={link}><ClipboardList className="w-4 h-4" /> Orders</NavLink>
        </nav>
        <div className="mt-auto pt-4 border-t border-neutral-100">
          <div className="text-[11px] text-neutral-500 px-2">Signed in as</div>
          <div className="text-[13px] font-semibold px-2 mt-0.5 truncate">{user?.email}</div>
          <button onClick={() => { logout(); nav('/'); }} className="mt-3 w-full text-sm flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Logout</button>
          <Link to="/" className="mt-1 w-full text-xs flex items-center gap-1 px-3 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100">View storefront <ArrowUpRight className="w-3 h-3" /></Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <div className="font-extrabold">Sobuj Admin</div>
          <button onClick={() => { logout(); nav('/'); }} className="text-xs text-red-600 font-semibold">Logout</button>
        </div>
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          <NavLink to="/admin" end className={({ isActive }) => `text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-700'}`}>Dashboard</NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-700'}`}>Products</NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-700'}`}>Orders</NavLink>
        </div>
        <div className="p-4 md:p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    (async () => {
      const [s, o] = await Promise.all([api.get('/admin/stats'), api.get('/admin/orders')]);
      setStats(s.data);
      setRecent(o.data.slice(0, 5));
    })();
  }, []);
  const cards = [
    { i: TrendingUp, label: 'Revenue', value: stats ? `৳${formatBDT(stats.revenue)}` : '—', color: 'bg-emerald-50 text-emerald-700' },
    { i: ClipboardList, label: 'Orders', value: stats?.orders ?? '—', color: 'bg-blue-50 text-blue-700' },
    { i: Package, label: 'Products', value: stats?.products ?? '—', color: 'bg-amber-50 text-amber-700' },
    { i: Users, label: 'Customers', value: stats?.customers ?? '—', color: 'bg-violet-50 text-violet-700' },
    { i: Clock, label: 'Pending orders', value: stats?.pendingOrders ?? '—', color: 'bg-rose-50 text-rose-700' },
  ];
  return (
    <div>
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <p className="text-sm text-neutral-500 mt-1">Welcome back — here’s what’s happening at Sobuj.</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
        {cards.map((c, i) => (
          <div key={i} className="rounded-2xl bg-white border border-neutral-100 p-4">
            <div className={`w-9 h-9 rounded-lg grid place-items-center ${c.color}`}><c.i className="w-4 h-4" /></div>
            <div className="text-[11px] text-neutral-500 mt-3">{c.label}</div>
            <div className="text-xl font-extrabold mt-0.5">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-base">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-emerald-700">View all</Link>
        </div>
        <div className="rounded-2xl bg-white border border-neutral-100 overflow-hidden">
          {recent.length === 0 ? (<div className="p-8 text-center text-sm text-neutral-500">No orders yet.</div>) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-[11px] uppercase text-neutral-500">
                <tr><th className="text-left px-4 py-2">Order</th><th className="text-left px-4 py-2">Customer</th><th className="text-left px-4 py-2">Method</th><th className="text-right px-4 py-2">Total</th><th className="text-left px-4 py-2">Status</th></tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-neutral-100">
                    <td className="px-4 py-3 font-mono text-xs">{o.orderNo}</td>
                    <td className="px-4 py-3">{o.userName}</td>
                    <td className="px-4 py-3 uppercase text-xs">{o.paymentMethod}</td>
                    <td className="px-4 py-3 text-right font-bold">৳{formatBDT(o.total)}</td>
                    <td className="px-4 py-3 capitalize text-xs">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
