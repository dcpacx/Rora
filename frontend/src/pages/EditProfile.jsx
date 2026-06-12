import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import MobileHeader from '../components/MobileHeader';
import { Camera, Save } from 'lucide-react';

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const fileRef = useRef(null);
  const [f, setF] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  if (!user) { nav('/login?next=/profile/edit'); return null; }

  const onFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'Image too large (max 2 MB)', variant: 'destructive' }); return; }
    const reader = new FileReader();
    reader.onload = () => setF((s) => ({ ...s, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim()) { toast({ title: 'Name and phone required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await updateProfile({ name: f.name.trim(), phone: f.phone.trim(), avatar: f.avatar || null });
      toast({ title: 'Profile updated' });
      nav('/profile');
    } catch (e) {
      toast({ title: 'Save failed', description: e.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="pb-8 max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Edit profile" back hideSearch />
      <div className="hidden lg:block mt-6 mb-2">
        <h1 className="text-3xl font-extrabold">Edit profile</h1>
      </div>
      <form onSubmit={submit} className="px-4 mt-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-100 grid place-items-center text-2xl font-extrabold text-emerald-800 overflow-hidden">
              {f.avatar ? <img src={f.avatar} alt="" className="w-full h-full object-cover" /> : (f.name || 'U').charAt(0).toUpperCase()}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-700 text-white grid place-items-center hover:bg-emerald-800 border-2 border-white">
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">Profile photo</div>
            <div className="text-[11.5px] text-neutral-500 mt-0.5">PNG/JPG, up to 2 MB.</div>
            {f.avatar && (<button type="button" onClick={() => setF((s) => ({ ...s, avatar: '' }))} className="mt-1.5 text-[11px] text-red-600 font-semibold">Remove photo</button>)}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-700 uppercase">Name</label>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="mt-1 w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-neutral-700 uppercase">Phone</label>
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" className="mt-1 w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-neutral-700 uppercase">Email</label>
          <input value={user.email} disabled className="mt-1 w-full h-12 px-4 rounded-xl bg-neutral-100 text-neutral-500 border border-neutral-200 text-sm" />
          <div className="text-[10.5px] text-neutral-400 mt-1">Email cannot be changed.</div>
        </div>

        <button disabled={saving} type="submit" className="w-full h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60 inline-flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
