import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import MobileHeader from '../components/MobileHeader';
import { MapPin, Plus, Pencil, Trash2, Star, X, Save, Home as HomeIcon, Briefcase, Building2 } from 'lucide-react';

const LABEL_ICONS = { Home: HomeIcon, Office: Briefcase, Other: Building2 };

const blank = (user) => ({
  label: 'Home',
  fullName: user?.name || '',
  phone: user?.phone || '',
  address: '',
  area: '',
  city: 'Dhaka',
  district: '',
  division: '',
  postalCode: '',
  note: '',
  isDefault: false,
});

const AddressForm = ({ value, onChange, onSubmit, onCancel, saving }) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <div className="flex gap-2 flex-wrap">
      {['Home', 'Office', 'Other'].map((l) => {
        const Icon = LABEL_ICONS[l];
        const active = value.label === l;
        return (
          <button key={l} type="button" data-testid={`addr-label-${l.toLowerCase()}`} onClick={() => onChange({ ...value, label: l })}
            className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-colors ${active ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-neutral-700 border-neutral-200 hover:border-emerald-400'}`}>
            <Icon className="w-3.5 h-3.5" /> {l}
          </button>
        );
      })}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input data-testid="addr-fullName" required value={value.fullName} onChange={(e) => onChange({ ...value, fullName: e.target.value })} placeholder="Full name *" className="h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
      <input data-testid="addr-phone" required value={value.phone} onChange={(e) => onChange({ ...value, phone: e.target.value })} placeholder="Mobile number *" inputMode="tel" className="h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
    </div>
    <textarea data-testid="addr-address" required value={value.address} onChange={(e) => onChange({ ...value, address: e.target.value })} rows={2} placeholder="House / Road / Building *" className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm resize-none" />
    <div className="grid grid-cols-2 gap-3">
      <input data-testid="addr-area" required value={value.area} onChange={(e) => onChange({ ...value, area: e.target.value })} placeholder="Area / Thana / Upazila *" className="h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
      <input data-testid="addr-city" value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} placeholder="City" className="h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <input data-testid="addr-district" value={value.district || ''} onChange={(e) => onChange({ ...value, district: e.target.value })} placeholder="District" className="h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
      <input data-testid="addr-division" value={value.division || ''} onChange={(e) => onChange({ ...value, division: e.target.value })} placeholder="Division" className="h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
      <input data-testid="addr-postal" value={value.postalCode || ''} onChange={(e) => onChange({ ...value, postalCode: e.target.value })} placeholder="Postal code" className="h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
    </div>
    <textarea data-testid="addr-note" value={value.note || ''} onChange={(e) => onChange({ ...value, note: e.target.value })} rows={2} placeholder="Note for rider (optional)" className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm resize-none" />
    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
      <input data-testid="addr-default" type="checkbox" checked={!!value.isDefault} onChange={(e) => onChange({ ...value, isDefault: e.target.checked })} className="w-4 h-4 accent-emerald-600" />
      Set as default address
    </label>
    <div className="flex gap-2 pt-1">
      <button type="button" onClick={onCancel} className="flex-1 h-12 rounded-full bg-neutral-100 text-neutral-700 font-semibold hover:bg-neutral-200 transition-colors">Cancel</button>
      <button data-testid="addr-save-btn" disabled={saving} type="submit" className="flex-1 h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60 inline-flex items-center justify-center gap-2 transition-colors">
        <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save address'}
      </button>
    </div>
  </form>
);

const Addresses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank(user));
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!user) { nav('/login?next=/profile/addresses'); } }, [user, nav]);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/auth/me/addresses'); setItems(data || []); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user]);

  const openAdd = () => { setEditing(null); setForm(blank(user)); setFormOpen(true); };
  const openEdit = (a) => { setEditing(a); setForm({ ...a }); setFormOpen(true); };
  const close = () => { setFormOpen(false); setEditing(null); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address || !form.area) {
      toast({ title: 'Please fill required fields', variant: 'destructive' }); return;
    }
    setSaving(true);
    try {
      if (editing) { await api.put(`/auth/me/addresses/${editing.id}`, form); toast({ title: 'Address updated' }); }
      else { await api.post('/auth/me/addresses', form); toast({ title: 'Address added' }); }
      await load(); close();
    } catch (e) {
      toast({ title: 'Save failed', description: e.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const remove = async (a) => {
    if (!window.confirm('Delete this address?')) return;
    try { await api.delete(`/auth/me/addresses/${a.id}`); toast({ title: 'Address deleted' }); await load(); }
    catch (e) { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const setDefault = async (a) => {
    try { await api.put(`/auth/me/addresses/${a.id}`, { isDefault: true }); await load(); }
    catch (e) { toast({ title: 'Update failed', variant: 'destructive' }); }
  };

  if (!user) return null;

  return (
    <div className="pb-24 lg:pb-12 max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Address book" back hideSearch />
      <div className="hidden lg:flex items-end justify-between mt-6 mb-2">
        <h1 className="text-3xl font-extrabold">Address book</h1>
        <button data-testid="addr-add-btn" onClick={openAdd} className="inline-flex items-center gap-2 bg-emerald-700 text-white h-11 px-5 rounded-full text-sm font-semibold hover:bg-emerald-800 transition-colors">
          <Plus className="w-4 h-4" /> Add new
        </button>
      </div>

      <div className="px-4 mt-3 space-y-3">
        {loading ? (
          <div className="space-y-3">{[1,2].map((i) => (<div key={i} className="h-32 rounded-2xl bg-neutral-100 animate-pulse" />))}</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
            <MapPin className="w-7 h-7 text-emerald-600 mx-auto" />
            <div className="text-[14px] font-semibold mt-2">No saved addresses</div>
            <div className="text-[12px] text-neutral-500 mt-1">Add an address once and reuse it during checkout.</div>
            <button data-testid="addr-add-btn-empty" onClick={openAdd} className="mt-4 inline-flex items-center gap-1.5 bg-emerald-700 text-white h-10 px-5 rounded-full text-[13px] font-semibold hover:bg-emerald-800 transition-colors">
              <Plus className="w-4 h-4" /> Add address
            </button>
          </div>
        ) : (
          <>
            {items.map((a) => {
              const Icon = LABEL_ICONS[a.label] || HomeIcon;
              return (
                <div key={a.id} data-testid={`addr-card-${a.id}`} className="rounded-2xl bg-white border border-neutral-100 p-4 hover:border-emerald-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 grid place-items-center"><Icon className="w-4 h-4 text-emerald-700" /></div>
                      <div>
                        <div className="font-extrabold text-[14px] flex items-center gap-1.5">
                          {a.label}
                          {a.isDefault && <span data-testid="addr-default-badge" className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"><Star className="w-3 h-3" /> Default</span>}
                        </div>
                        <div className="text-[12px] text-neutral-500 mt-0.5">{a.fullName} · {a.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button data-testid={`addr-edit-${a.id}`} onClick={() => openEdit(a)} className="w-9 h-9 grid place-items-center rounded-full hover:bg-neutral-100 text-neutral-600"><Pencil className="w-4 h-4" /></button>
                      <button data-testid={`addr-delete-${a.id}`} onClick={() => remove(a)} className="w-9 h-9 grid place-items-center rounded-full hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="text-[13px] text-neutral-700 mt-2.5 leading-relaxed">
                    {a.address}, {a.area}{a.city ? `, ${a.city}` : ''}{a.district ? `, ${a.district}` : ''}{a.postalCode ? ` — ${a.postalCode}` : ''}
                  </div>
                  {a.note && <div className="text-[11.5px] text-neutral-500 mt-1.5">Note: {a.note}</div>}
                  {!a.isDefault && (
                    <button data-testid={`addr-makedefault-${a.id}`} onClick={() => setDefault(a)} className="mt-2.5 text-[12px] font-semibold text-emerald-700 inline-flex items-center gap-1 hover:text-emerald-800 transition-colors">
                      <Star className="w-3.5 h-3.5" /> Set as default
                    </button>
                  )}
                </div>
              );
            })}
            <button data-testid="addr-add-btn-bottom" onClick={openAdd} className="w-full lg:hidden mt-2 h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 inline-flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Add new address
            </button>
          </>
        )}
      </div>

      {/* Drawer / Modal for add/edit */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" data-testid="addr-form-modal">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative w-full md:max-w-lg bg-white md:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="font-extrabold text-base">{editing ? 'Edit address' : 'New address'}</div>
              <button data-testid="addr-form-close" onClick={close} className="w-9 h-9 grid place-items-center rounded-full hover:bg-neutral-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <AddressForm value={form} onChange={setForm} onSubmit={save} onCancel={close} saving={saving} />
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:block px-4 mt-6">
        <Link to="/profile" className="text-[12px] text-neutral-500 hover:text-neutral-700">← Back to profile</Link>
      </div>
    </div>
  );
};

export default Addresses;
