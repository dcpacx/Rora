import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, KeyRound, Check, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../hooks/use-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resetToken, setResetToken] = useState(''); // demo only
  const { toast } = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot', { email });
      setDone(true);
      if (data.resetToken) setResetToken(data.resetToken); // demo convenience
    } catch (e) {
      toast({ title: 'Try again', description: e.response?.data?.detail || 'Failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-full bg-white px-6 pt-12 pb-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-700 grid place-items-center"><KeyRound className="w-7 h-7 text-white" /></div>
        <h1 className="text-2xl font-extrabold mt-3">Forgot password?</h1>
        <p className="text-sm text-neutral-500 mt-1">Enter your email and we'll send a reset link.</p>
      </div>
      {done ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
            <Check className="w-6 h-6 text-emerald-700 mx-auto" />
            <div className="text-sm font-semibold mt-2">Check your email</div>
            <div className="text-[12px] text-neutral-600 mt-1">If an account exists for <b>{email}</b>, we've sent a password reset token.</div>
            {resetToken && (
              <div className="mt-3 text-left bg-white rounded-xl p-3 border border-emerald-100">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-700">Demo only · token</div>
                <div data-testid="forgot-demo-token" className="font-mono text-[11px] break-all mt-1">{resetToken}</div>
                <button data-testid="forgot-go-reset" onClick={() => nav(`/reset-password?token=${resetToken}`)} className="mt-2 inline-flex items-center gap-1 text-emerald-700 font-semibold text-[12px]">
                  Continue to reset <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <Link to="/login" className="block text-center text-sm text-emerald-700 font-semibold">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input data-testid="forgot-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
          <button data-testid="forgot-submit" disabled={loading} type="submit" className="w-full h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60 transition-colors">{loading ? 'Sending…' : 'Send reset link'}</button>
          <div className="text-center text-sm text-neutral-500 pt-2">Remembered? <Link to="/login" className="text-emerald-700 font-semibold">Sign in</Link></div>
        </form>
      )}
    </div>
  );
};

export const ResetPassword = () => {
  const { search } = useLocation();
  const initialToken = new URLSearchParams(search).get('token') || '';
  const [token, setToken] = useState(initialToken);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) { toast({ title: 'Password must be 6+ characters', variant: 'destructive' }); return; }
    if (pw !== pw2) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset', { token, newPassword: pw });
      toast({ title: 'Password updated', description: 'Sign in with your new password.' });
      nav('/login');
    } catch (e) {
      toast({ title: 'Reset failed', description: e.response?.data?.detail || 'Token may be invalid', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-full bg-white px-6 pt-12 pb-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-700 grid place-items-center"><Leaf className="w-7 h-7 text-white" /></div>
        <h1 className="text-2xl font-extrabold mt-3">Set new password</h1>
        <p className="text-sm text-neutral-500 mt-1">Use a strong password with at least 6 characters.</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input data-testid="reset-token" required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Reset token" className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm font-mono" />
        <input data-testid="reset-password" required type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" minLength={6} className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
        <input data-testid="reset-password-confirm" required type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Confirm new password" minLength={6} className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
        <button data-testid="reset-submit" disabled={loading} type="submit" className="w-full h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60 transition-colors">{loading ? 'Updating…' : 'Update password'}</button>
        <div className="text-center text-sm text-neutral-500 pt-2"><Link to="/login" className="text-emerald-700 font-semibold">Back to sign in</Link></div>
      </form>
    </div>
  );
};
