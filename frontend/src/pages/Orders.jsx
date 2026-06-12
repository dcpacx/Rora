import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { api, formatBDT } from '../lib/api';
import MobileHeader from '../components/MobileHeader';
import { useAuth } from '../contexts/AuthContext';

const statusColors = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipped: 'bg-violet-50 text-violet-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try { const { data } = await api.get('/orders/my'); setOrders(data); } finally { setLoading(false); }
    })();
  }, [user]);

  if (!user) return (
    <div className="pb-4">
      <MobileHeader title="My orders" hideSearch />
      <div className="px-6 py-20 text-center">
        <Package className="w-10 h-10 text-neutral-300 mx-auto" />
        <h2 className="text-base font-bold mt-3">Sign in to view orders</h2>
        <p className="text-xs text-neutral-500 mt-1">Track and reorder your previous purchases.</p>
        <Link to="/login?next=/orders" className="inline-flex mt-5 items-center gap-2 bg-emerald-600 text-white px-5 h-11 rounded-full text-sm font-semibold">Sign in</Link>
      </div>
    </div>
  );

  return (
    <div className="pb-4">
      <MobileHeader title="My orders" hideSearch />
      <div className="px-4 mt-3 space-y-2.5">
        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-neutral-300 mx-auto" />
            <h2 className="text-base font-bold mt-3">No orders yet</h2>
            <p className="text-xs text-neutral-500 mt-1">Start shopping organic, fresh, local.</p>
            <Link to="/" className="inline-flex mt-5 items-center gap-2 bg-emerald-600 text-white px-5 h-11 rounded-full text-sm font-semibold">Browse products</Link>
          </div>
        ) : orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-neutral-100 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11.5px] text-neutral-500">{new Date(o.createdAt).toLocaleString()}</div>
                <div className="text-[13px] font-bold mt-0.5">{o.orderNo}</div>
              </div>
              <span className={`text-[10.5px] font-semibold capitalize px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-neutral-100 text-neutral-700'}`}>{o.status}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {o.items.slice(0, 4).map((it, i) => (
                <img key={i} src={it.image} alt={it.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/80/f5f5f5/525252?text=img'; }} className="w-12 h-12 rounded-lg object-cover bg-neutral-50 shrink-0" />
              ))}
              {o.items.length > 4 && <span className="text-[11px] text-neutral-500 ml-1">+{o.items.length - 4}</span>}
            </div>
            <div className="mt-3 pt-3 border-t border-dashed border-neutral-200 flex items-center justify-between text-sm">
              <div>
                <div className="text-[10.5px] text-neutral-500 uppercase">{o.paymentMethod}</div>
                <div className="font-extrabold text-emerald-700">৳{formatBDT(o.total)}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
