import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Leaf, Paperclip, Smile, Check, CheckCheck, Image as ImageIcon, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import MobileHeader from '../components/MobileHeader';

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const formatDay = (iso) => {
  try {
    const d = new Date(iso);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const day = new Date(d); day.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - day) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ''; }
};

const EMOJIS = ['👍','❤️','😀','😂','🌱','🙏','🌿','🍋','🥦','🍯','✅','🚚','📦','🤝','🌞','💚'];

const QUICK_REPLIES = [
  'When will my order arrive?',
  'Is this product fully organic?',
  'Do you deliver outside Dhaka?',
  'Can I pay on delivery?',
];

const MessagesPage = () => {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState(null); // {dataUrl}
  const [isTyping, setIsTyping] = useState(false); // simulated typing indicator from "support"
  const [lastAdminAt, setLastAdminAt] = useState(null);
  const scrollerRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimerRef = useRef(null);

  const refresh = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/messages');
      setMsgs((prev) => {
        // detect new admin reply to clear typing indicator
        const lastAdmin = [...data].reverse().find((m) => m.fromAdmin);
        if (lastAdmin && lastAdmin.createdAt !== lastAdminAt) {
          setLastAdminAt(lastAdmin.createdAt);
          setIsTyping(false);
        }
        return data;
      });
    } catch (_) {}
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    refresh().finally(() => setLoading(false));
    const id = setInterval(refresh, 6000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    const el = scrollerRef.current; if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs.length, isTyping]);

  if (!user) return (
    <div className="pb-4 max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Messages" back hideSearch />
      <div className="px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 grid place-items-center"><MessageCircle className="w-7 h-7 text-emerald-700" /></div>
        <h2 className="text-lg font-extrabold mt-4">Sign in to chat with us</h2>
        <p className="text-sm text-neutral-500 mt-1">Ask questions about products, delivery, or your order.</p>
        <Link to="/login?next=/messages" data-testid="messages-signin" className="inline-flex mt-5 items-center gap-2 bg-emerald-700 text-white px-5 h-11 rounded-full text-sm font-semibold hover:bg-emerald-800 transition-colors">Sign in</Link>
      </div>
    </div>
  );

  const onAttachClick = () => fileRef.current?.click();

  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) { alert('Image too large (max 1.5 MB)'); return; }
    const r = new FileReader(); r.onload = () => setAttachment({ dataUrl: r.result, name: f.name }); r.readAsDataURL(f);
  };

  const insertEmoji = (e) => setText((t) => t + e);

  const send = async (overrideText) => {
    const t = (overrideText ?? text).trim();
    if ((!t && !attachment) || sending) return;
    setSending(true);
    setShowEmoji(false);
    // Construct payload. We piggyback the image dataUrl inside the message text using a marker.
    let payload = t;
    if (attachment?.dataUrl) {
      payload = (t ? t + '\n' : '') + `[image]${attachment.dataUrl}[/image]`;
    }
    const optimistic = { id: `tmp-${Date.now()}`, userId: user.id, text: payload, fromAdmin: false, createdAt: new Date().toISOString(), pending: true };
    setMsgs((m) => [...m, optimistic]);
    setText('');
    setAttachment(null);
    // simulate admin "typing" after a short delay
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setIsTyping(true), 800);
    setTimeout(() => setIsTyping(false), 6000); // auto-clear after 6s if no reply
    try {
      const { data } = await api.post('/messages', { text: payload });
      setMsgs((m) => m.map((x) => x.id === optimistic.id ? { ...data, delivered: true } : x));
    } catch (_) {
      setMsgs((m) => m.filter((x) => x.id !== optimistic.id));
      setText(t);
    } finally { setSending(false); }
  };

  const submit = (e) => { e.preventDefault(); send(); };

  // Group messages by day
  const grouped = [];
  let lastDay = null;
  msgs.forEach((m) => {
    const day = formatDay(m.createdAt);
    if (day !== lastDay) { grouped.push({ kind: 'day', label: day, key: `d-${day}-${m.id}` }); lastDay = day; }
    grouped.push({ kind: 'msg', m, key: m.id });
  });

  return (
    <div className="flex flex-col h-[100vh] lg:h-auto max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Support chat" back hideSearch />
      {/* Desktop hero header */}
      <div className="hidden lg:flex mt-6 mb-3 items-center gap-3 rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-white p-5">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white/20 grid place-items-center"><Leaf className="w-6 h-6 text-white" /></div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-emerald-700 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="font-extrabold text-lg">প্রকৃতির ঘ্রাণ Support</div>
          <div className="text-[12px] opacity-90 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Online · usually replies within minutes</div>
        </div>
      </div>

      {/* Mobile chat header pill */}
      <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white border-b border-emerald-800">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center"><Leaf className="w-5 h-5 text-white" /></div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-300 border-2 border-emerald-600 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm truncate">প্রকৃতির ঘ্রাণ Support</div>
          <div className="text-[10.5px] opacity-90 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Online now</div>
        </div>
      </div>

      <div ref={scrollerRef} data-testid="chat-scroll" className="flex-1 overflow-y-auto px-3 py-3 lg:px-4 space-y-1.5 bg-[#f4faf7] lg:rounded-2xl lg:border lg:border-neutral-100 lg:min-h-[420px] lg:max-h-[60vh]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.06) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(16,185,129,0.04) 0, transparent 40%)' }}>
        {loading ? (
          <div className="space-y-2 px-2">
            {[1,2,3].map((i) => (<div key={i} className={`h-10 rounded-2xl ${i%2 ? 'bg-emerald-100/60 ml-auto w-2/3' : 'bg-neutral-200/60 w-1/2'} animate-pulse`} />))}
          </div>
        ) : msgs.length === 0 ? (
          <div className="text-center py-12 animate-in fade-in duration-300">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 grid place-items-center"><Leaf className="w-6 h-6 text-emerald-700" /></div>
            <div className="text-sm font-extrabold mt-3">Hi {user.name.split(' ')[0]} 👋</div>
            <div className="text-[12px] text-neutral-500 mt-1 px-6">Ask about products, delivery, or your order — we usually reply within minutes.</div>
            <div className="mt-5 grid grid-cols-1 gap-2 max-w-xs mx-auto">
              {QUICK_REPLIES.map((q) => (
                <button key={q} data-testid={`chat-quick-${q.slice(0,8)}`} onClick={() => send(q)} className="text-[12.5px] text-emerald-800 bg-white border border-emerald-200 rounded-full px-4 py-2 hover:bg-emerald-50 transition-colors text-left">
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : grouped.map((g) => g.kind === 'day' ? (
          <div key={g.key} className="text-center my-3">
            <span className="text-[10.5px] text-neutral-500 bg-white/80 backdrop-blur px-2.5 py-0.5 rounded-full border border-neutral-100">{g.label}</span>
          </div>
        ) : (() => {
          const m = g.m;
          // parse image marker
          const imgMatch = (m.text || '').match(/\[image\](.*?)\[\/image\]/s);
          const cleanText = (m.text || '').replace(/\[image\].*?\[\/image\]/s, '').trim();
          return (
            <div key={g.key} className={`flex ${m.fromAdmin ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
              <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 shadow-sm ${m.fromAdmin ? 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-md' : 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-br-md'}`}>
                {m.fromAdmin && (<div className="text-[10.5px] font-bold text-emerald-700 mb-0.5 flex items-center gap-1"><Leaf className="w-2.5 h-2.5" /> Support</div>)}
                {imgMatch && <img src={imgMatch[1]} alt="" className="rounded-xl mb-1 max-w-full max-h-60 object-cover" />}
                {cleanText && <div className="text-[13.5px] whitespace-pre-wrap break-words leading-relaxed">{cleanText}</div>}
                <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${m.fromAdmin ? 'text-neutral-400' : 'text-emerald-100/90 justify-end'}`}>
                  <span>{formatTime(m.createdAt)}</span>
                  {!m.fromAdmin && (m.pending ? <Check className="w-3 h-3" /> : <CheckCheck className="w-3 h-3" />)}
                </div>
              </div>
            </div>
          );
        })())}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div className="px-3 lg:px-4 py-2 bg-white border-t border-neutral-100 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <div className="relative">
            <img src={attachment.dataUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
            <button onClick={() => setAttachment(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white grid place-items-center hover:bg-black"><X className="w-3 h-3" /></button>
          </div>
          <div className="text-[12px] text-neutral-600 truncate flex-1">{attachment.name}</div>
        </div>
      )}

      {/* Emoji panel */}
      {showEmoji && (
        <div className="px-3 lg:px-4 pt-2 pb-1 bg-white border-t border-neutral-100 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((e) => (
              <button key={e} type="button" data-testid={`chat-emoji-${e}`} onClick={() => insertEmoji(e)} className="w-9 h-9 grid place-items-center rounded-lg hover:bg-emerald-50 text-xl transition-colors">{e}</button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-1.5 px-3 lg:px-4 py-2.5 bg-white border-t border-neutral-200 lg:rounded-2xl lg:border lg:mt-3">
        <button type="button" data-testid="chat-attach-btn" onClick={onAttachClick} aria-label="Attach image" className="w-10 h-10 grid place-items-center rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors"><Paperclip className="w-4.5 h-4.5" /></button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <button type="button" data-testid="chat-emoji-btn" onClick={() => setShowEmoji((s) => !s)} aria-label="Pick emoji" className={`w-10 h-10 grid place-items-center rounded-full transition-colors ${showEmoji ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-neutral-100 text-neutral-600'}`}><Smile className="w-4.5 h-4.5" /></button>
        <input data-testid="chat-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 h-11 px-4 rounded-full bg-neutral-100 outline-none text-sm border border-transparent focus:bg-white focus:border-emerald-400 transition-colors" />
        <button data-testid="chat-send-btn" type="submit" disabled={(!text.trim() && !attachment) || sending} className="w-11 h-11 rounded-full bg-emerald-700 text-white grid place-items-center disabled:opacity-40 hover:bg-emerald-800 active:scale-95 transition-transform">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MessagesPage;
