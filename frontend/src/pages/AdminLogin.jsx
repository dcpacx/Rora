import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';
import { ADMIN_PATH } from '../lib/admin-path';

const AdminLogin = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u.role !== 'admin') {
        toast({ title: 'Access denied', description: 'This portal is restricted to administrators.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      toast({ title: `Welcome back, ${u.name.split(' ')[0]}.` });
      nav(ADMIN_PATH);
    } catch (e) {
      toast({ title: 'Authentication failed', description: e.response?.data?.detail || 'Invalid credentials', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{
      background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 60%), #020617',
    }}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center shadow-[0_0_40px_rgba(16,185,129,0.35)]">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 text-[10.5px] uppercase tracking-[0.18em] font-bold px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3" /> Secure portal
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-3" style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', Inter, sans-serif" }}>প্রকৃতির ঘ্রাণ</h1>
            <p className="text-[12.5px] text-white/60 mt-1">Administrator access only</p>
          </div>
          <form onSubmit={submit} className="space-y-3 mt-7">
            <div>
              <label className="text-[10.5px] uppercase tracking-wider font-semibold text-white/50">Admin email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" autoComplete="username" className="mt-1 w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white outline-none focus:border-emerald-400 focus:bg-white/[0.1] text-sm placeholder:text-white/30" />
            </div>
            <div>
              <label className="text-[10.5px] uppercase tracking-wider font-semibold text-white/50">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className="mt-1 w-full h-12 px-4 pr-11 rounded-xl bg-white/[0.06] border border-white/10 text-white outline-none focus:border-emerald-400 focus:bg-white/[0.1] text-sm placeholder:text-white/30" />
                <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-3 grid place-items-center text-white/50 hover:text-white/80">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full h-12 mt-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold tracking-wide hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]">
              {loading ? 'Authenticating…' : 'Enter dashboard'}
            </button>
          </form>
          <div className="mt-5 text-center text-[10.5px] text-white/40">
            This is a private admin portal. Unauthorized access is prohibited and monitored.
          </div>
        </div>
        <div className="text-center mt-5 text-[10.5px] text-white/30">
          © {new Date().getFullYear()} প্রকৃতির ঘ্রাণ · Admin Portal
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
