import React, { useEffect, useState } from 'react';
import { api, formatBDT } from '../../lib/api';
import { TrendingUp, Package, BarChart3 } from 'lucide-react';

const Bar = ({ value, max, color = 'bg-emerald-500' }) => {
  const w = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${w}%` }} />;
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    try { const { data } = await api.get('/admin/analytics'); setData(data); } finally { setLoading(false); }
  })(); }, []);

  if (loading || !data) return (<div className="p-10 text-center text-sm text-neutral-500">Loading analytics…</div>);

  const maxRev = Math.max(...data.series.map((s) => s.revenue), 1);
  const maxOrders = Math.max(...data.series.map((s) => s.orders), 1);
  const totalStatus = Object.values(data.statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold">Analytics</h1>
        <p className="text-sm text-neutral-500 mt-1">Last 14 days · revenue, orders, top products.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:gap-3 mt-4">
        <div className="rounded-2xl bg-white border border-neutral-100 p-4">
          <div className="flex items-center gap-2 text-emerald-700 text-[12px] font-semibold"><TrendingUp className="w-4 h-4" /> Total revenue (14d)</div>
          <div className="text-2xl md:text-3xl font-extrabold mt-1">৳{formatBDT(data.totalRevenue)}</div>
        </div>
        <div className="rounded-2xl bg-white border border-neutral-100 p-4">
          <div className="flex items-center gap-2 text-blue-700 text-[12px] font-semibold"><Package className="w-4 h-4" /> Total orders (14d)</div>
          <div className="text-2xl md:text-3xl font-extrabold mt-1">{data.totalOrders}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-neutral-100 p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-sm md:text-base">Daily revenue</h2>
          <span className="text-[11px] text-neutral-500">last 14 days</span>
        </div>
        <div className="flex items-end gap-1.5 md:gap-2 h-32 md:h-40">
          {data.series.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                <div className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 min-h-[2px]" style={{ height: `${(s.revenue / maxRev) * 100}%` }} />
              </div>
              <div className="text-[9px] text-neutral-500 hidden md:block">{s.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-neutral-100 p-4">
          <h2 className="font-extrabold text-sm md:text-base mb-3">Order status</h2>
          <div className="space-y-2.5">
            {Object.entries(data.statusCounts).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-xs mb-1"><span className="capitalize text-neutral-700 font-medium">{k}</span><span className="font-semibold">{v}</span></div>
                <Bar value={v} max={totalStatus} />
              </div>
            ))}
            {Object.keys(data.statusCounts).length === 0 && <div className="text-xs text-neutral-500">No orders yet.</div>}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-neutral-100 p-4">
          <h2 className="font-extrabold text-sm md:text-base mb-3">Payment methods</h2>
          <div className="space-y-2.5">
            {Object.entries(data.methodCounts).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-xs mb-1"><span className="uppercase text-neutral-700 font-medium">{k}</span><span className="font-semibold">{v}</span></div>
                <Bar value={v} max={data.totalOrders || 1} color={k === 'cod' ? 'bg-neutral-700' : k === 'bkash' ? 'bg-pink-500' : 'bg-orange-500'} />
              </div>
            ))}
            {Object.keys(data.methodCounts).length === 0 && <div className="text-xs text-neutral-500">No orders yet.</div>}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-neutral-100 p-4 md:p-5">
        <h2 className="font-extrabold text-sm md:text-base mb-3">Top selling products</h2>
        {data.topProducts.length === 0 ? (<div className="text-xs text-neutral-500">No sales yet.</div>) : (
          <div className="space-y-2">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-xs font-bold text-neutral-400 w-5">#{i + 1}</div>
                <img src={p.image} alt={p.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/60/f5f5f5/525252?text=img'; }} className="w-10 h-10 rounded-lg object-cover bg-neutral-50" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold line-clamp-1">{p.name}</div>
                  <div className="text-[11px] text-neutral-500">{p.qty} sold</div>
                </div>
                <div className="text-sm font-extrabold text-emerald-700">৳{formatBDT(p.revenue)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
