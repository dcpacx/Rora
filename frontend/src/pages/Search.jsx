import React, { useEffect, useState, useMemo } from 'react';
import { api, formatBDT } from '../lib/api';
import ProductCard from '../components/ProductCard';
import MobileHeader from '../components/MobileHeader';
import { Search as SearchIcon } from 'lucide-react';

const SearchPage = () => {
  const [q, setQ] = useState('');
  const [all, setAll] = useState([]);
  useEffect(() => { (async () => { const { data } = await api.get('/products'); setAll(data); })(); }, []);
  const results = useMemo(() => {
    const n = q.toLowerCase().trim();
    if (!n) return all;
    return all.filter((p) => p.name.toLowerCase().includes(n) || p.description?.toLowerCase().includes(n));
  }, [q, all]);
  return (
    <div className="pb-4">
      <MobileHeader title="Search" back hideSearch />
      <div className="px-4 mt-3">
        <div className="flex items-center bg-neutral-100 rounded-full h-11 px-4 gap-2">
          <SearchIcon className="w-4 h-4 text-neutral-500" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for honey, oil, spices…" className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <div className="text-[11px] text-neutral-500 mt-3">{results.length} products</div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {results.map((p) => (<ProductCard key={p.id} product={p} />))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
