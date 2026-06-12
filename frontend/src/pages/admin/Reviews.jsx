import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { Star, Trash2, MessageSquare } from 'lucide-react';

const AdminReviews = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/reviews'); setItems(data || []); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const remove = async (r) => {
    if (!window.confirm('Delete this review?')) return;
    try { await api.delete(`/admin/reviews/${r.id}`); toast({ title: 'Review deleted' }); await load(); }
    catch (e) { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold">Reviews</h1>
        <p className="text-sm text-neutral-500 mt-1">Moderate customer reviews. Deleting recomputes the product rating.</p>
      </div>
      {loading ? (
        <div className="grid gap-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-neutral-100 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
          <MessageSquare className="w-7 h-7 text-emerald-600 mx-auto" />
          <div className="text-[14px] font-semibold mt-2">No reviews yet</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((r) => (
            <div key={r.id} data-testid={`admin-review-${r.id}`} className="rounded-2xl bg-white border border-neutral-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold truncate">{r.userName} <span className="text-neutral-400 font-normal">on</span> {r.productSlug}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1,2,3,4,5].map((n) => <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} />)}
                    <span className="text-[10.5px] text-neutral-400 ml-1">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.text && <div className="text-[13px] text-neutral-700 mt-2 leading-relaxed whitespace-pre-wrap">{r.text}</div>}
                </div>
                <button onClick={() => remove(r)} data-testid={`admin-review-delete-${r.id}`} className="w-9 h-9 grid place-items-center rounded-full hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
