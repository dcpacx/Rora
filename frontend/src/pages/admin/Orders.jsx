import React, { useEffect, useState } from 'react';
import { api, formatBDT } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { ChevronDown } from 'lucide-react';

const statusList = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const colors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-violet-50 text-violet-700 border-violet-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => { setLoading(true); const { data } = await api.get('/admin/orders'); setOrders(data); setLoading(false); };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/admin/orders/${id}`, { status }); toast({ title: `Order → ${status}` }); load(); }
    catch (e) { toast({ title: 'Update failed', variant: 'destructive' }); }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">Orders</h1>
          <p className="text-sm text-neutral-500">{orders.length} total — keep customers updated.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
        {['all', ...statusList].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap capitalize ${filter === s ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
            {s} ({s === 'all' ? orders.length : orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {loading ? <div className="p-8 text-center text-sm text-neutral-500">Loading…</div> : filtered.length === 0 ? (
          <div className="rounded-2xl border border-neutral-100 bg-white p-10 text-center text-sm text-neutral-500">No orders here.</div>
        ) : filtered.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white border border-neutral-100 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-mono text-xs text-neutral-500">{o.orderNo}</div>
                <div className="font-extrabold mt-0.5">{o.userName} <span className="text-xs font-normal text-neutral-500">· {o.userPhone}</span></div>
                <div className="text-[11.5px] text-neutral-500 mt-0.5">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-emerald-700 text-lg">৳{formatBDT(o.total)}</div>
                <div className="text-[11px] text-neutral-500 uppercase">{o.paymentMethod} · {o.paymentStatus}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-50 p-3 text-xs">
                <div className="font-semibold text-neutral-700 mb-1">Delivery</div>
                <div className="text-neutral-600">{o.address.fullName}, {o.address.phone}</div>
                <div className="text-neutral-600">{o.address.address}, {o.address.area}, {o.address.city}</div>
                {o.address.note && <div className="text-neutral-500 mt-1 italic">Note: {o.address.note}</div>}
              </div>
              <div className="rounded-xl bg-neutral-50 p-3 text-xs">
                <div className="font-semibold text-neutral-700 mb-1">Items ({o.items.length})</div>
                <ul className="space-y-0.5 max-h-28 overflow-auto">
                  {o.items.map((it, i) => (<li key={i} className="flex justify-between"><span className="truncate pr-2">{it.qty}× {it.name}</span><span className="shrink-0">৳{formatBDT(it.price * it.qty)}</span></li>))}
                </ul>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Status</span>
                <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className={`px-3 h-9 rounded-full border text-xs font-semibold capitalize ${colors[o.status]}`}>
                  {statusList.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              {o.paymentTxn && <div className="text-[11px] font-mono text-neutral-500">{o.paymentTxn}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
