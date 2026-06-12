import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatBDT } from '../lib/api';
import MobileHeader from '../components/MobileHeader';
import { MapPin, Phone, User, Package, Truck, Check, ClipboardList, AlertCircle, Clock, X as XIcon, CheckCircle2, CircleDashed } from 'lucide-react';

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Check },
];

const payColors = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-neutral-200 text-neutral-700',
  rejected: 'bg-red-100 text-red-700',
};

const OrderDetail = () => {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    (async () => { try { const { data } = await api.get(`/orders/${id}`); setO(data); } catch { setErr(true); } })();
  }, [id]);

  if (err) return (
    <div className="pb-4 max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Order" back hideSearch />
      <div className="px-6 py-16 text-center">
        <AlertCircle className="w-9 h-9 text-neutral-300 mx-auto" />
        <div className="text-sm font-semibold mt-3">Order not found</div>
        <Link to="/orders" className="inline-flex mt-4 items-center gap-2 bg-emerald-700 text-white px-5 h-11 rounded-full text-sm font-semibold">My orders</Link>
      </div>
    </div>
  );
  if (!o) return <div className="p-8 text-center text-sm text-neutral-500">Loading…</div>;

  const cancelled = o.status === 'cancelled';
  const activeIdx = cancelled ? -1 : statusSteps.findIndex((s) => s.key === o.status);

  return (
    <div className="pb-4 max-w-3xl mx-auto lg:px-6">
      <MobileHeader title={o.orderNo} back hideSearch />
      <div className="px-4 mt-3">
        {/* Status header */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] opacity-80">Order placed</div>
              <div className="text-[13px] font-semibold">{new Date(o.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] opacity-80">Total</div>
              <div className="text-xl font-extrabold">৳{formatBDT(o.total)}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10.5px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full capitalize">{o.status}</span>
            <span className={`text-[10.5px] uppercase font-bold px-2 py-0.5 rounded-full capitalize ${payColors[o.paymentStatus] || 'bg-white/20'} ${o.paymentStatus === 'unpaid' ? '' : ''}`} style={{ color: o.paymentStatus === 'paid' ? '#065f46' : undefined }}>Pay: {o.paymentStatus}</span>
            <span className="text-[10.5px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full">{o.paymentMethod}</span>
          </div>
        </div>

        {/* Tracker — vertical timeline */}
        <div className="mt-4 rounded-2xl bg-white border border-neutral-100 p-4">
          <h3 className="font-extrabold text-sm mb-3">Order tracking</h3>
          {cancelled ? (
            <div className="flex items-center gap-2 text-red-600 text-sm font-semibold"><XIcon className="w-4 h-4" /> Order cancelled</div>
          ) : (
            <ol className="relative pl-7">
              {statusSteps.map((s, i) => {
                const done = i <= activeIdx;
                const current = i === activeIdx;
                const Icon = s.icon;
                // Find time from statusHistory if present
                const hist = (o.statusHistory || []).find((h) => h.status === s.key);
                return (
                  <li key={s.key} data-testid={`track-step-${s.key}`} className="relative pb-5 last:pb-0">
                    {/* connector */}
                    {i < statusSteps.length - 1 && (
                      <span className={`absolute left-[-14px] top-7 bottom-0 w-0.5 ${i < activeIdx ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                    )}
                    {/* dot */}
                    <span className={`absolute -left-[22px] top-0 w-7 h-7 rounded-full grid place-items-center ${done ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-400'} ${current ? 'ring-4 ring-emerald-100' : ''}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="ml-2">
                      <div className={`text-[13px] font-extrabold ${done ? 'text-neutral-900' : 'text-neutral-500'}`}>{s.label}</div>
                      <div className="text-[11px] text-neutral-500">
                        {hist ? new Date(hist.at).toLocaleString() : (current ? 'In progress' : (done ? '' : 'Pending'))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Items */}
        <div className="mt-4 rounded-2xl bg-white border border-neutral-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 font-extrabold text-sm flex items-center gap-2"><Package className="w-4 h-4 text-emerald-700" /> Items ({o.items.length})</div>
          <div className="divide-y divide-neutral-100">
            {o.items.map((it, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <img src={it.image} alt={it.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/80/f5f5f5/525252?text=img'; }} className="w-12 h-12 rounded-lg object-cover bg-neutral-50" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold line-clamp-1">{it.name}</div>
                  <div className="text-[11px] text-neutral-500">{it.unit} · {it.qty} × ৳{formatBDT(it.price)}</div>
                </div>
                <div className="text-sm font-extrabold text-emerald-700">৳{formatBDT(it.price * it.qty)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mt-4 rounded-2xl bg-white border border-neutral-100 p-4 text-sm">
          <div className="flex items-center justify-between"><span className="text-neutral-500">Subtotal</span><span className="font-semibold">৳{formatBDT(o.subtotal)}</span></div>
          <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">Delivery</span><span className="font-semibold">{o.delivery === 0 ? 'Free' : `৳${formatBDT(o.delivery)}`}</span></div>
          {o.discount > 0 && (<div className="flex items-center justify-between mt-1 text-emerald-700"><span>Discount {o.couponCode ? `(${o.couponCode})` : ''}</span><span className="font-semibold">-৳{formatBDT(o.discount)}</span></div>)}
          <div className="border-t border-dashed border-neutral-200 my-2" />
          <div className="flex items-center justify-between"><span className="font-bold">Total</span><span className="font-extrabold text-emerald-700">৳{formatBDT(o.total)}</span></div>
        </div>

        {/* Address */}
        <div className="mt-4 rounded-2xl bg-white border border-neutral-100 p-4 text-sm">
          <div className="font-extrabold text-sm mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-700" /> Delivery to</div>
          <div className="flex items-center gap-1 text-neutral-700"><User className="w-3 h-3 text-neutral-400" /> {o.address.fullName}</div>
          <div className="flex items-center gap-1 text-neutral-700 mt-0.5"><Phone className="w-3 h-3 text-neutral-400" /> {o.address.phone}</div>
          <div className="text-neutral-600 mt-1">{o.address.address}, {o.address.area}, {o.address.city}</div>
          {o.address.note && <div className="mt-1 text-neutral-500 italic">Note: {o.address.note}</div>}
        </div>

        {/* Payment */}
        <div className="mt-4 rounded-2xl bg-white border border-neutral-100 p-4 text-sm">
          <div className="font-extrabold text-sm mb-2 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-emerald-700" /> Payment</div>
          <div className="flex items-center justify-between"><span className="text-neutral-500">Method</span><span className="font-semibold uppercase">{o.paymentMethod}</span></div>
          <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">Status</span><span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-[11px] ${payColors[o.paymentStatus] || 'bg-neutral-100 text-neutral-700'}`}>{o.paymentStatus}</span></div>
          {o.paymentPhone && <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">Sender phone</span><span className="font-semibold">{o.paymentPhone}</span></div>}
          {o.paymentTxn && <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">TrxID</span><span className="font-mono text-xs">{o.paymentTxn}</span></div>}
          {o.paymentNote && <div className="mt-2 text-[11px] text-neutral-500 italic">Note: {o.paymentNote}</div>}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
