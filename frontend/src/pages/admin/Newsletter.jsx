import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Mail, Copy, Download } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AdminNewsletter = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try { const { data } = await api.get('/admin/newsletter'); setItems(data || []); }
    finally { setLoading(false); }
  })(); }, []);

  const copyAll = () => {
    const text = items.map((i) => i.email).join(', ');
    try { navigator.clipboard.writeText(text); toast({ title: `${items.length} emails copied` }); } catch (_) {}
  };

  const downloadCsv = () => {
    const csv = ['email,subscribedAt', ...items.map((i) => `${i.email},${i.createdAt}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'newsletter-subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold">Newsletter</h1>
          <p className="text-sm text-neutral-500 mt-1">{items.length} subscriber{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyAll} data-testid="newsletter-copy-all" disabled={!items.length} className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 h-10 px-4 rounded-full text-[12.5px] font-semibold hover:bg-neutral-200 disabled:opacity-50 transition-colors"><Copy className="w-3.5 h-3.5" /> Copy</button>
          <button onClick={downloadCsv} data-testid="newsletter-export-csv" disabled={!items.length} className="inline-flex items-center gap-1.5 bg-emerald-700 text-white h-10 px-4 rounded-full text-[12.5px] font-semibold hover:bg-emerald-800 disabled:opacity-50 transition-colors"><Download className="w-3.5 h-3.5" /> Export CSV</button>
        </div>
      </div>
      {loading ? (
        <div className="grid gap-2">{[1,2,3].map((i) => <div key={i} className="h-12 rounded-xl bg-neutral-100 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
          <Mail className="w-7 h-7 text-emerald-600 mx-auto" />
          <div className="text-[14px] font-semibold mt-2">No subscribers yet</div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-neutral-100 divide-y divide-neutral-100">
          {items.map((it) => (
            <div key={it.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <span className="font-mono">{it.email}</span>
              <span className="text-[11px] text-neutral-500">{new Date(it.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
