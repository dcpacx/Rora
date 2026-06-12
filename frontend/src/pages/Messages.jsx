import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, X, Leaf, ArrowDown } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import MobileHeader from '../components/MobileHeader';

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const MessagesPage = () => {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);

  const refresh = async () => {
    if (!user) return;
    try { const { data } = await api.get('/messages'); setMsgs(data); }
    catch (_) {}
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    refresh().finally(() => setLoading(false));
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    const el = scrollerRef.current; if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  if (!user) return (
    <div className="pb-4 max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Messages" back hideSearch />
      <div className="px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 grid place-items-center"><MessageCircle className="w-7 h-7 text-emerald-700" /></div>
        <h2 className="text-lg font-extrabold mt-4">Sign in to chat with us</h2>
        <p className="text-sm text-neutral-500 mt-1">Ask questions about products, delivery, or your order.</p>
        <Link to="/login?next=/messages" className="inline-flex mt-5 items-center gap-2 bg-emerald-700 text-white px-5 h-11 rounded-full text-sm font-semibold">Sign in</Link>
      </div>
    </div>
  );

  const send = async (e) => {
    e?.preventDefault?.();
    const t = text.trim(); if (!t || sending) return;
    setSending(true);
    // Optimistic UI
    const optimistic = { id: `tmp-${Date.now()}`, userId: user.id, text: t, fromAdmin: false, createdAt: new Date().toISOString() };
    setMsgs((m) => [...m, optimistic]);
    setText('');
    try {
      const { data } = await api.post('/messages', { text: t });
      setMsgs((m) => m.map((x) => x.id === optimistic.id ? data : x));
    } catch (_) {
      setMsgs((m) => m.filter((x) => x.id !== optimistic.id));
      setText(t);
    } finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-[100vh] lg:h-auto max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Support chat" back hideSearch />
      <div className="hidden lg:block mt-6 mb-2">
        <h1 className="text-3xl font-extrabold">Messages</h1>
        <p className="text-sm text-neutral-500 mt-1">Chat directly with our support team.</p>
      </div>
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-3 lg:px-0 lg:py-4 space-y-2 bg-neutral-50 lg:bg-transparent lg:rounded-2xl lg:border lg:border-neutral-100 lg:min-h-[420px] lg:max-h-[60vh]">
        {loading ? (<div className="text-center text-sm text-neutral-500 py-8">Loading…</div>) : msgs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 grid place-items-center"><Leaf className="w-6 h-6 text-emerald-700" /></div>
            <div className="text-sm font-semibold mt-3">Hi {user.name.split(' ')[0]}, how can we help?</div>
            <div className="text-[12px] text-neutral-500 mt-1">Ask about products, delivery, or your order — we usually reply within minutes.</div>
          </div>
        ) : msgs.map((m) => (
          <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${m.fromAdmin ? 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-md' : 'bg-emerald-700 text-white rounded-br-md'}`}>
              {m.fromAdmin && (<div className="text-[10.5px] font-semibold text-emerald-700 mb-0.5">Support</div>)}
              <div className="text-[13.5px] whitespace-pre-wrap break-words">{m.text}</div>
              <div className={`text-[10px] mt-0.5 ${m.fromAdmin ? 'text-neutral-400' : 'text-emerald-100'}`}>{formatTime(m.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex items-center gap-2 px-4 py-3 lg:px-0 bg-white lg:bg-transparent border-t border-neutral-200 lg:border-t-0 lg:mt-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 h-11 px-4 rounded-full bg-neutral-100 outline-none text-sm border border-transparent focus:bg-white focus:border-emerald-400" />
        <button type="submit" disabled={!text.trim() || sending} className="w-11 h-11 rounded-full bg-emerald-700 text-white grid place-items-center disabled:opacity-40 hover:bg-emerald-800">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MessagesPage;
