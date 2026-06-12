import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Leaf, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const { search } = useLocation();
  const next = new URLSearchParams(search).get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast({ title: `Welcome back, ${u.name.split(' ')[0]}!` });
      nav(next);
    } catch (e) {
      toast({ title: 'Login failed', description: e.response?.data?.detail || 'Check your credentials', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-full bg-white px-6 pt-12 pb-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-700 grid place-items-center"><Leaf className="w-7 h-7 text-white" /></div>
        <h1 className="text-2xl font-extrabold mt-3" style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', Inter, sans-serif" }}>প্রকৃতির ঘ্রাণ</h1>
        <p className="text-sm text-neutral-500 mt-1">Sign in to continue shopping organic.</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input data-testid="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
        <div className="relative">
          <input data-testid="login-password" type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full h-12 px-4 pr-11 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
          <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-3 grid place-items-center text-neutral-500">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
        <button data-testid="login-submit" disabled={loading} type="submit" className="w-full h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div className="text-center mt-5 text-sm text-neutral-500">New here? <Link to="/signup" className="text-emerald-700 font-semibold">Create account</Link></div>
    </div>
  );
};

export const Signup = () => {
  const { signup } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.phone, form.password);
      toast({ title: 'Account created 🌱', description: 'Welcome to Sobuj!' });
      nav('/');
    } catch (e) {
      toast({ title: 'Sign up failed', description: e.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-full bg-white px-6 pt-10 pb-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-700 grid place-items-center"><Leaf className="w-7 h-7 text-white" /></div>
        <h1 className="text-2xl font-extrabold mt-3" style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', Inter, sans-serif" }}>প্রকৃতির ঘ্রাণ</h1>
        <p className="text-sm text-neutral-500 mt-1">Create your account — pure organic, delivered.</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input data-testid="signup-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
        <input data-testid="signup-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
        <input data-testid="signup-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Mobile number" inputMode="tel" className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
        <input data-testid="signup-password" required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (min 6 chars)" minLength={6} className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
        <button data-testid="signup-submit" disabled={loading} type="submit" className="w-full h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60">{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <div className="text-center mt-5 text-sm text-neutral-500">Already have an account? <Link to="/login" className="text-emerald-700 font-semibold">Sign in</Link></div>
    </div>
  );
};
