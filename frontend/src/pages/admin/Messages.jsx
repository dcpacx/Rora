import React, { useEffect, useRef, useState } from 'react';
import { api, formatBDT } from '../../lib/api';
import { Send, MessageCircle, Mail, Leaf } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const AdminMessages = () => {
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const scrollerRef = useRef(null);
  const { toast } = useToast();

  const loadThreads = async () => {
    try { const { data } = await api.get('/admin/messages/threads'); setThreads(data); } finally { setLoadingThreads(false); }
  };
  const openThread = async (t) => {
    setActive(t); setLoadingThread(true);
    try { const { data } = await api.get(`/admin/messages/${t.userId}`); setMsgs(data); }
    finally { setLoadingThread(false); }
    loadThreads();
  };

  useEffect(() => { loadThreads(); const id = setInterval(loadThreads, 15000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(async () => {
      try { const { data } = await api.get(`/admin/messages/${active.userId}`); setMsgs(data); } catch (_) {}
    }, 7000);
    return () => clearInterval(id);
  }, [active]);
  useEffect(() => { const el = scrollerRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs.length]);

  const send = async (e) => {
    e?.preventDefault?.();
    const t = text.trim(); if (!t || !active || sending) return;
    setSending(true);
    const optimistic = { id: `tmp-${Date.now()}`, userId: active.userId, text: t, fromAdmin: true, createdAt: new Date().toISOString() };
    setMsgs((m) => [...m, optimistic]);
    setText('');
    try {
      const { data } = await api.post('/admin/messages', { userId: active.userId, text: t });
      setMsgs((m) => m.map((x) => x.id === optimistic.id ? data : x));
      loadThreads();
    } catch (e) {
      setMsgs((m) => m.filter((x) => x.id !== optimistic.id));
      setText(t);
      toast({ title: 'Failed to send', variant: 'destructive' });
    } finally { setSending(false); }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-extrabold">Customer messages</h1>
        <p className="text-sm text-neutral-500 mt-1">{threads.length} conversation{threads.length !== 1 ? 's' : ''} — reply to keep customers happy.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[calc(100vh-200px)] min-h-[480px]">
        {/* Thread list */}
        <div className={`md:col-span-1 rounded-2xl bg-white border border-neutral-100 overflow-hidden ${active ? 'hidden md:flex' : 'flex'} flex-col`}>
          <div className="px-3 py-2.5 border-b border-neutral-100 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">Inbox</div>
          <div className="flex-1 overflow-y-auto">
            {loadingThreads ? <div className="p-6 text-center text-xs text-neutral-500">Loading…</div> : threads.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-8 h-8 text-neutral-300 mx-auto" />
                <div className="text-sm font-semibold mt-2">No messages yet</div>
                <div className="text-[11px] text-neutral-500 mt-1">When a customer chats, it'll appear here.</div>
              </div>
            ) : threads.map((t) => (
              <button key={t.userId} onClick={() => openThread(t)} className={`w-full text-left px-3 py-3 border-b border-neutral-100 hover:bg-neutral-50 flex items-start gap-3 ${active?.userId === t.userId ? 'bg-emerald-50' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white grid place-items-center text-sm font-bold overflow-hidden shrink-0">
                  {t.userAvatar ? <img src={t.userAvatar} alt="" className="w-full h-full object-cover" /> : t.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-[13px] truncate">{t.userName}</div>
                    <div className="text-[10px] text-neutral-500 shrink-0">{formatTime(t.lastMessage.createdAt)}</div>
                  </div>
                  <div className="text-[11.5px] text-neutral-500 line-clamp-1 mt-0.5">{t.lastMessage.fromAdmin ? 'You: ' : ''}{t.lastMessage.text}</div>
                </div>
                {t.unread > 0 && (<span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shrink-0 mt-1">{t.unread}</span>)}
              </button>
            ))}
          </div>
        </div>

        {/* Thread detail */}
        <div className={`md:col-span-2 rounded-2xl bg-white border border-neutral-100 overflow-hidden ${active ? 'flex' : 'hidden md:flex'} flex-col`}>
          {!active ? (
            <div className="flex-1 grid place-items-center text-center px-6">
              <div>
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 grid place-items-center"><Leaf className="w-6 h-6 text-emerald-700" /></div>
                <div className="text-sm font-semibold mt-3">Select a conversation</div>
                <div className="text-[11.5px] text-neutral-500 mt-1">Pick a customer on the left to view & reply.</div>
              </div>
            </div>
          ) : (
            <>
              <div className="px-3 py-2.5 border-b border-neutral-100 flex items-center gap-3">
                <button onClick={() => setActive(null)} className="md:hidden text-xs text-neutral-600 font-semibold">← Back</button>
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white grid place-items-center text-sm font-bold overflow-hidden">
                  {active.userAvatar ? <img src={active.userAvatar} alt="" className="w-full h-full object-cover" /> : active.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-[14px] truncate">{active.userName}</div>
                  <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1"><Mail className="w-3 h-3" /> {active.userEmail}</div>
                </div>
              </div>
              <div ref={scrollerRef} className="flex-1 overflow-y-auto bg-neutral-50 px-3 py-3 space-y-2">
                {loadingThread ? <div className="text-center text-xs text-neutral-500 py-6">Loading…</div> : msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${m.fromAdmin ? 'bg-emerald-700 text-white rounded-br-md' : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-md'}`}>
                      <div className="text-[13px] whitespace-pre-wrap break-words">{m.text}</div>
                      <div className={`text-[10px] mt-0.5 ${m.fromAdmin ? 'text-emerald-100' : 'text-neutral-400'}`}>{formatTime(m.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="flex items-center gap-2 px-3 py-3 border-t border-neutral-200">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a reply…" className="flex-1 h-11 px-4 rounded-full bg-neutral-100 outline-none text-sm border border-transparent focus:bg-white focus:border-emerald-400" />
                <button type="submit" disabled={!text.trim() || sending} className="w-11 h-11 rounded-full bg-emerald-700 text-white grid place-items-center disabled:opacity-40"><Send className="w-4 h-4" /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
