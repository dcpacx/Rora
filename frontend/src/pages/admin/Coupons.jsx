import React, { useEffect, useState } from 'react';
import { api, formatBDT } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { Plus, Pencil, Trash2, Save, X, Tag, Eye, EyeOff, Copy } from 'lucide-react';

const blank = () => ({ code: '', type: 'flat', value: 0, minOrder: 0, maxDiscount: null, active: true, usageLimit: null, expiresAt: '' });

const AdminCoupons = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/coupons'); setItems(data || []); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(blank()); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c, expiresAt: c.expiresAt || '' }); setOpen(true); };
  const close = () => { setOpen(false); setEditing(null); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.code || !form.value) { toast({ title: 'Code & value required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, value: parseFloat(form.value), minOrder: parseFloat(form.minOrder || 0) };
      if (form.maxDiscount === '' || form.maxDiscount === null) payload.maxDiscount = null;
      else payload.maxDiscount = parseFloat(form.maxDiscount);
      if (form.usageLimit === '' || form.usageLimit === null) payload.usageLimit = null;
      else payload.usageLimit = parseInt(form.usageLimit);
      if (!form.expiresAt) payload.expiresAt = null;
      if (editing) await api.put(`/admin/coupons/${editing.id}`, payload);
      else await api.post('/admin/coupons', payload);
      toast({ title: editing ? 'Coupon updated' : 'Coupon added' });
      await load(); close();
    } catch (e) { toast({ title: 'Save failed', description: e.response?.data?.detail || 'Try again', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    try { await api.delete(`/admin/coupons/${c.id}`); toast({ title: 'Coupon deleted' }); await load(); }
    catch (e) { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const copyCode = (code) => { try { navigator.clipboard.writeText(code); toast({ title: 'Code copied' }); } catch (_) {} };

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold">Coupons</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage promotional codes & discounts.</p>
        </div>
        <button data-testid="coupon-add-btn" onClick={openAdd} className="inline-flex items-center gap-2 bg-emerald-700 text-white h-11 px-4 md:px-5 rounded-full text-sm font-semibold hover:bg-emerald-800 transition-colors">
          <Plus className="w-4 h-4" /> New coupon
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3">{[1,2].map((i) => <div key={i} className="h-24 rounded-2xl bg-neutral-100 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
          <Tag className="w-7 h-7 text-emerald-600 mx-auto" />
          <div className="text-[14px] font-semibold mt-2">No coupons yet</div>
          <div className="text-[12px] text-neutral-500 mt-1">Create a promo code to drive conversions.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((c) => (
            <div key={c.id} data-testid={`coupon-card-${c.id}`} className="rounded-2xl bg-white border border-neutral-100 p-4 hover:border-emerald-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyCode(c.code)} className="font-extrabold font-mono text-base text-emerald-800 inline-flex items-center gap-1 hover:text-emerald-900 transition-colors">
                      {c.code} <Copy className="w-3 h-3 opacity-60" />
                    </button>
                    <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 ${c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {c.active ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />} {c.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="text-[13px] mt-1">
                    {c.type === 'flat' ? <>Flat <b>৳{formatBDT(c.value)}</b></> : <>{c.value}% off{c.maxDiscount ? <> (up to ৳{formatBDT(c.maxDiscount)})</> : null}</>}
                    {c.minOrder ? <span className="text-neutral-500"> · min ৳{formatBDT(c.minOrder)}</span> : null}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Used: {c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ''}{c.expiresAt ? ` · expires ${c.expiresAt.slice(0,10)}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(c)} data-testid={`coupon-edit-${c.id}`} className="w-9 h-9 grid place-items-center rounded-full hover:bg-neutral-100"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(c)} data-testid={`coupon-delete-${c.id}`} className="w-9 h-9 grid place-items-center rounded-full hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative w-full md:max-w-lg bg-white md:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="font-extrabold text-base">{editing ? 'Edit coupon' : 'New coupon'}</div>
              <button onClick={close} className="w-9 h-9 grid place-items-center rounded-full hover:bg-neutral-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="p-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 uppercase">Code *</label>
                <input data-testid="coupon-code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" className="mt-1 w-full h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase">Type</label>
                  <select data-testid="coupon-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm">
                    <option value="flat">Flat amount</option>
                    <option value="percent">Percent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase">{form.type === 'flat' ? 'Amount (৳) *' : 'Percent (%) *'}</label>
                  <input data-testid="coupon-value" required type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase">Min order (৳)</label>
                  <input data-testid="coupon-minOrder" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
                </div>
                {form.type === 'percent' && (
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 uppercase">Max discount (৳)</label>
                    <input data-testid="coupon-maxDiscount" type="number" value={form.maxDiscount ?? ''} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="No cap" className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase">Usage limit</label>
                  <input data-testid="coupon-usageLimit" type="number" value={form.usageLimit ?? ''} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase">Expires</label>
                  <input data-testid="coupon-expires" type="date" value={form.expiresAt ? form.expiresAt.slice(0, 10) : ''} onChange={(e) => setForm({ ...form, expiresAt: e.target.value ? `${e.target.value}T23:59:59` : '' })} className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input data-testid="coupon-active" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-emerald-600" />
                Active
              </label>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={close} className="flex-1 h-12 rounded-full bg-neutral-100 text-neutral-700 font-semibold hover:bg-neutral-200">Cancel</button>
                <button data-testid="coupon-save" disabled={saving} type="submit" className="flex-1 h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60 inline-flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
