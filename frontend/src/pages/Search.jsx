import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../mock';
import { Search } from 'lucide-react';

const SearchPage = () => {
  const [sp] = useSearchParams();
  const q = sp.get('q') || '';
  const items = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(needle) ||
      p.store.toLowerCase().includes(needle) ||
      p.category.toLowerCase().includes(needle)
    );
  }, [q]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 mt-6 mb-16">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Search className="w-4 h-4" />
        Showing {items.length} results for <span className="text-neutral-900 font-semibold">“{q || 'all products'}”</span>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-24">
          <h1 className="text-xl font-extrabold">No products match “{q}”</h1>
          <p className="text-sm text-neutral-500 mt-1">Try a different keyword or browse categories.</p>
          <Link to="/" className="inline-block mt-5 bg-neutral-900 text-white px-5 h-11 leading-[44px] rounded-full text-sm font-semibold hover:bg-neutral-800">Go home</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-5">
          {items.map((p) => (<ProductCard key={p.id} product={p} />))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
