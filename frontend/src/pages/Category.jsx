import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../mock';

const CategoryPage = () => {
  const { slug } = useParams();
  const cat = categories.find((c) => c.slug === slug);
  const [sort, setSort] = useState('popular');

  const items = useMemo(() => {
    let list = products.filter((p) => p.category === slug);
    if (list.length === 0) list = products; // fallback so the page never feels empty
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'discount') list = [...list].sort((a, b) => (b.discount || 0) - (a.discount || 0));
    return list;
  }, [slug, sort]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 mt-6">
      <div className="text-xs text-neutral-500 flex items-center gap-1">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-900 font-medium">{cat?.name || 'Category'}</span>
      </div>
      <div className="flex items-end justify-between mt-3 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">{cat?.name || 'All products'}</h1>
          <p className="text-sm text-neutral-500 mt-1">{items.length} products · verified sellers · 7-day returns</p>
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm bg-white border border-neutral-200 rounded-full h-10 px-3 outline-none focus:border-neutral-400">
            <option value="popular">Most popular</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="discount">Biggest discount</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((p) => (<ProductCard key={p.id} product={p} />))}
      </div>
    </div>
  );
};

export default CategoryPage;
