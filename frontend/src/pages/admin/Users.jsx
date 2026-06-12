import React, { useEffect, useState } from 'react';
import { api, formatBDT } from '../../lib/api';
import { Users, X, Mail, Phone, ChevronRight, ShoppingBag, Calendar } from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-violet-100 text-violet-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const UserDetail = ({ userId, onClose }) => {
  const [data, setData] = useState(null);
  useEffect(() => { (async () => { const { data } = await api.get(`/admin/users/${userId}`); setData(data); })(); }, [userId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-3.5 flex items-center justify-between">
          <h2 className="font-extrabold text-lg">Customer details</h2>
          <button onClick={onClose} className="w-9 h-9 grid place-items-center rounded-full hover:bg-neutral-100"><X className="w-5 h-5" /></button>
        </div>
        {!data ? <div className="p-10 text-center text-sm text-neutral-500">Loading…</div> : (
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white grid place-items-center text-xl font-extrabold">{data.user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="font-extrabold text-lg">{data.user.name}</div>
                <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {data.user.email}</div>
                <div className="text-xs text-neutral-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {data.user.phone}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-50 p-3 text-center"><div className="text-[10px] text-emerald-700">Orders</div><div className="text-xl font-extrabold text-emerald-800 mt-0.5">{data.orders.length}</div></div>
              <div className="rounded-xl bg-blue-50 p-3 text-center"><div className="text-[10px] text-blue-700">Total spent</div><div className="text-base font-extrabold text-blue-800 mt-0.5">৳{formatBDT(data.orders.reduce((s, o) => s + o.total, 0))}</div></div>
              <div className="rounded-xl bg-violet-50 p-3 text-center"><div className="text-[10px] text-violet-700">Joined</div><div className="text-[12px] font-semibold text-violet-800 mt-0.5">{new Date(data.user.createdAt).toLocaleDateString()}</div></div>
            </div>

            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-700 mb-2">Order history</div>
              {data.orders.length === 0 ? (
                <div className="rounded-xl bg-neutral-50 p-6 text-center text-sm text-neutral-500">No orders yet.</div>
              ) : (
                <div className="space-y-2">
                  {data.orders.map((o) => (
                    <div key={o.id} className="rounded-xl border border-neutral-100 p-3 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs">{o.orderNo}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{new Date(o.createdAt).toLocaleString()} · {o.items.length} items</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-emerald-700">৳{formatBDT(o.total)}</div>
                        <span className={`inline-block mt-0.5 text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-neutral-100 text-neutral-700'}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => { (async () => { try { const { data } = await api.get('/admin/users'); setUsers(data); } finally { setLoading(false); } })(); }, []);

  const filtered = users.filter((u) => {
    const n = q.toLowerCase();
    return !n || u.name.toLowerCase().includes(n) || u.email.toLowerCase().includes(n) || u.phone.includes(n);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Customers</h1>
          <p className="text-sm text-neutral-500">{users.length} registered customers.</p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or phone…" className="w-full md:w-72 h-10 px-4 rounded-full bg-white border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
      </div>

      <div className="rounded-2xl bg-white border border-neutral-100 overflow-hidden">
        {loading ? <div className="p-10 text-center text-sm text-neutral-500">Loading…</div> : filtered.length === 0 ? (
          <div className="p-16 text-center"><Users className="w-10 h-10 text-neutral-300 mx-auto" /><div className="text-sm font-semibold mt-2">No customers found</div></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase text-neutral-500">
              <tr>
                <th className="text-left px-4 py-2">Customer</th>
                <th className="text-left px-4 py-2 hidden md:table-cell">Phone</th>
                <th className="text-right px-4 py-2">Orders</th>
                <th className="text-right px-4 py-2">Spent</th>
                <th className="text-left px-4 py-2 hidden md:table-cell">Joined</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-neutral-100 hover:bg-neutral-50 cursor-pointer" onClick={() => setSelected(u.id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-bold">{u.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="font-semibold text-[13px] line-clamp-1">{u.name}</div>
                        <div className="text-[11px] text-neutral-500 line-clamp-1">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">{u.phone}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold flex items-center justify-end gap-1"><ShoppingBag className="w-3.5 h-3.5 text-neutral-400" />{u.orderCount}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-700">৳{formatBDT(u.totalSpent)}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500 hidden md:table-cell"><div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(u.createdAt).toLocaleDateString()}</div></td>
                  <td className="px-4 py-3 text-right"><ChevronRight className="w-4 h-4 text-neutral-400 inline" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && <UserDetail userId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default AdminUsers;
