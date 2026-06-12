import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import MobileHeader from '../components/MobileHeader';
import { Leaf } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams();
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, c] = await Promise.all([api.get('/products', { params: { category: slug } }), api.get('/categories')]);
      setItems(p.data);
      setCat(c.data.find((x) => x.slug === slug));
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="pb-4">
      <MobileHeader title={cat?.name || 'Category'} back />
      <div className="px-4 mt-3">
        <div className="text-[12px] text-neutral-500 mb-3">{items.length} products • all organic, hand-picked.</div>
        {loading ? (
          <div className="py-10 text-center text-neutral-500 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <Leaf className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-neutral-700 mt-2">No products yet</div>
            <div className="text-xs text-neutral-500 mt-1">New arrivals are on the way — check back soon.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
