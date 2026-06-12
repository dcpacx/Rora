import React, { useEffect, useState } from 'react';
import { Star, Send, User } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const Stars = ({ value = 0, size = 14, onChange, interactive = false }) => (
  <div className="inline-flex items-center gap-0.5">
    {[1,2,3,4,5].map((n) => (
      <button key={n} type="button" disabled={!interactive} onClick={() => interactive && onChange?.(n)}
        data-testid={interactive ? `review-star-${n}` : undefined}
        className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${interactive ? 'hover:scale-110 transition-transform' : ''}`}>
        <Star className={`${n <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`} style={{ width: size, height: size }} />
      </button>
    ))}
  </div>
);

const Reviews = ({ product, onChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [own, setOwn] = useState(null); // user's own review if exists

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${product.id}/reviews`);
      setItems(data);
      const mine = user ? data.find((r) => r.userId === user.id) : null;
      setOwn(mine || null);
      if (mine) { setRating(mine.rating); setText(mine.text || ''); }
    } finally { setLoading(false); }
  };

  // Check if user is eligible to review (must have ordered)
  useEffect(() => {
    if (!user) { setCanReview(false); return; }
    (async () => {
      try {
        const { data } = await api.get('/orders/my');
        const ordered = (data || []).some((o) => (o.items || []).some((i) => i.productId === product.id));
        setCanReview(ordered);
      } catch (_) { setCanReview(false); }
    })();
  }, [user, product.id]);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [product.id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { toast({ title: 'Sign in to review', variant: 'destructive' }); return; }
    if (!canReview) { toast({ title: 'You can review after purchasing this product', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { productId: product.id, rating, text });
      toast({ title: own ? 'Review updated' : 'Review submitted', description: 'Thank you for your feedback!' });
      await load();
      onChange?.();
    } catch (e) {
      toast({ title: 'Failed', description: e.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const avg = product.avgRating || 0;
  const count = product.reviewCount || items.length;

  return (
    <section className="mt-6">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-extrabold">Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <Stars value={avg} size={16} />
            <span className="text-[12.5px] font-semibold">{avg ? avg.toFixed(1) : '—'}</span>
            <span className="text-[11.5px] text-neutral-500">({count} review{count !== 1 ? 's' : ''})</span>
          </div>
        </div>
      </div>

      {user && canReview && (
        <form onSubmit={submit} data-testid="review-form" className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-4 space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold text-emerald-800">{own ? 'Edit your review' : 'Write a review'}</div>
            <Stars value={rating} onChange={setRating} interactive size={20} />
          </div>
          <textarea data-testid="review-text" value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="How was your experience with this product?" className="w-full p-3 rounded-xl bg-white border border-neutral-200 outline-none focus:border-emerald-500 text-sm resize-none" />
          <button data-testid="review-submit" type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 bg-emerald-700 text-white text-[13px] font-semibold h-10 px-5 rounded-full hover:bg-emerald-800 disabled:opacity-60 transition-colors">
            <Send className="w-3.5 h-3.5" /> {submitting ? 'Sending…' : (own ? 'Update review' : 'Submit review')}
          </button>
        </form>
      )}

      {user && !canReview && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-[12px] text-amber-800 mb-4">Reviews open after you've ordered this product.</div>
      )}

      <div className="space-y-2.5">
        {loading ? (
          <div className="space-y-2">{[1,2].map((i) => <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-[12.5px] text-neutral-500 text-center py-6">No reviews yet — be the first to share your experience.</div>
        ) : items.map((r) => (
          <div key={r.id} data-testid={`review-item-${r.id}`} className="rounded-2xl bg-white border border-neutral-100 p-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center text-[12px] font-bold">{r.userName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold truncate">{r.userName}</div>
                <div className="flex items-center gap-2"><Stars value={r.rating} size={12} /><span className="text-[10.5px] text-neutral-400">{new Date(r.createdAt).toLocaleDateString()}</span></div>
              </div>
            </div>
            {r.text && <div className="text-[13px] text-neutral-700 mt-2 leading-relaxed whitespace-pre-wrap">{r.text}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export { Stars };
export default Reviews;
