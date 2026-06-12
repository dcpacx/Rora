import React, { useEffect, useState } from 'react';
import { api, formatBDT } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { Save, Smartphone, Wallet, Info } from 'lucide-react';

const AdminSettings = () => {
  const { toast } = useToast();
  const [s, setS] = useState({ bkashNumber: '', nagadNumber: '', bkashType: 'personal', nagadType: 'personal', instructions: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
    try { const { data } = await api.get('/settings/payment'); setS({ ...s, ...data }); } finally { setLoading(false); }
    // eslint-disable-next-line
  })(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!s.bkashNumber && !s.nagadNumber) { toast({ title: 'অন্তত একটি নাম্বার দিন', variant: 'destructive' }); return; }
    setSaving(true);
    try { await api.put('/admin/settings/payment', s); toast({ title: 'Payment settings updated' }); }
    catch (e) { toast({ title: 'Save failed', description: e.response?.data?.detail || 'Try again', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  if (loading) return (<div className="p-10 text-center text-sm text-neutral-500">Loading settings…</div>);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">Payment settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Configure your official bKash & Nagad numbers. These will be shown to customers on checkout.</p>
      </div>
      <form onSubmit={save} className="max-w-2xl space-y-4">
        <div className="rounded-2xl bg-white border border-neutral-100 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-pink-600 grid place-items-center"><Smartphone className="w-4 h-4 text-white" /></div>
            <div>
              <div className="font-extrabold text-sm">bKash</div>
              <div className="text-[10.5px] text-neutral-500">Used when customer picks bKash</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-[10.5px] uppercase tracking-wider font-semibold text-neutral-600">Number</label>
              <input value={s.bkashNumber} onChange={(e) => setS({ ...s, bkashNumber: e.target.value })} placeholder="01XXXXXXXXX" className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm font-mono" />
            </div>
            <div>
              <label className="text-[10.5px] uppercase tracking-wider font-semibold text-neutral-600">Account type</label>
              <select value={s.bkashType} onChange={(e) => setS({ ...s, bkashType: e.target.value })} className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm">
                <option value="personal">Personal</option>
                <option value="merchant">Merchant</option>
                <option value="agent">Agent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-100 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500 grid place-items-center"><Wallet className="w-4 h-4 text-white" /></div>
            <div>
              <div className="font-extrabold text-sm">Nagad</div>
              <div className="text-[10.5px] text-neutral-500">Used when customer picks Nagad</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-[10.5px] uppercase tracking-wider font-semibold text-neutral-600">Number</label>
              <input value={s.nagadNumber} onChange={(e) => setS({ ...s, nagadNumber: e.target.value })} placeholder="01XXXXXXXXX" className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm font-mono" />
            </div>
            <div>
              <label className="text-[10.5px] uppercase tracking-wider font-semibold text-neutral-600">Account type</label>
              <select value={s.nagadType} onChange={(e) => setS({ ...s, nagadType: e.target.value })} className="mt-1 w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm">
                <option value="personal">Personal</option>
                <option value="merchant">Merchant</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-100 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-emerald-700" /><div className="font-extrabold text-sm">Checkout instructions</div></div>
          <textarea value={s.instructions} onChange={(e) => setS({ ...s, instructions: e.target.value })} rows={3} placeholder="Shown to customers on the payment screen." className="w-full p-3 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm resize-none" />
        </div>

        <button disabled={saving} type="submit" className="w-full md:w-auto px-6 h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60 inline-flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
