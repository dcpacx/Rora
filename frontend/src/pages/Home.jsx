import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { api, formatBDT } from '../lib/api';
import ProductCard from '../components/ProductCard';
import MobileHeader from '../components/MobileHeader';

const Skeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
        <div className="aspect-square bg-neutral-100" />
        <div className="p-2.5 space-y-2">
          <div className="h-3 bg-neutral-100 rounded w-3/4" />
          <div className="h-3 bg-neutral-100 rounded w-1/2" />
          <div className="h-4 bg-neutral-100 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const Home = () => {
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [c, f, a] = await Promise.all([
          api.get('/categories'),
          api.get('/products', { params: { featured: true } }),
          api.get('/products'),
        ]);
        setCats(c.data);
        setFeatured(f.data);
        setAll(a.data);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="pb-4">
      <MobileHeader />

      {/* Promo banner */}
      <div className="px-4 mt-3 max-w-7xl mx-auto lg:px-6 lg:mt-6">
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-white p-5 lg:p-12 overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1 bg-white/15 text-[10.5px] lg:text-xs font-semibold px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> This week's harvest
            </div>
            <h2 className="text-2xl lg:text-5xl font-extrabold mt-2 leading-tight">Farm-fresh<br />organic goodness</h2>
            <p className="text-[12.5px] lg:text-base opacity-90 mt-1 lg:mt-3">Free delivery on orders over ৳500</p>
            <button onClick={() => nav('/categories')} className="mt-3 lg:mt-5 inline-flex items-center gap-1.5 bg-white text-emerald-700 text-[12.5px] lg:text-sm font-semibold px-3.5 lg:px-5 h-9 lg:h-11 rounded-full hover:bg-emerald-50 transition-colors">
              Shop now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <Leaf className="absolute -right-4 -bottom-4 w-32 h-32 lg:w-64 lg:h-64 text-white/15 -rotate-12" />
        </div>
      </div>

      {/* Trust badges */}
      <div className="px-4 mt-4 max-w-7xl mx-auto lg:px-6 grid grid-cols-3 gap-2 lg:gap-4">
        {[
          { i: Leaf, t: '100% Organic' },
          { i: Truck, t: 'Same-day Delivery' },
          { i: ShieldCheck, t: 'Quality Promise' },
        ].map((it, i) => (
          <div key={i} className="rounded-xl bg-emerald-50 p-2.5 lg:p-4 text-center">
            <it.i className="w-4 h-4 lg:w-6 lg:h-6 text-emerald-600 mx-auto" />
            <div className="text-[10.5px] lg:text-sm font-semibold text-emerald-800 mt-1 lg:mt-2 leading-tight">{it.t}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section className="px-4 mt-5 max-w-7xl mx-auto lg:px-6 lg:mt-10">
        <div className="flex items-center justify-between mb-3 lg:mb-5">
          <h3 className="text-base lg:text-2xl font-extrabold tracking-tight">Shop by category</h3>
          <Link to="/categories" className="text-[12px] lg:text-sm font-semibold text-emerald-600">See all</Link>
        </div>
        <div className="flex lg:grid lg:grid-cols-8 gap-2.5 lg:gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1">
          {cats.map((c) => (
            <Link key={c.slug} to={`/category/${c.slug}`} className="shrink-0 w-[78px] lg:w-auto text-center">
              <div className="w-[72px] h-[72px] lg:w-full lg:aspect-square lg:h-auto rounded-2xl bg-emerald-50 overflow-hidden mx-auto">
                {c.image && <img src={c.image} alt={c.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover" />}
              </div>
              <div className="text-[11px] lg:text-xs font-medium text-neutral-700 mt-1.5 lg:mt-2 line-clamp-2 leading-tight">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="px-4 mt-5 max-w-7xl mx-auto lg:px-6 lg:mt-10">
        <div className="flex items-center justify-between mb-3 lg:mb-5">
          <h3 className="text-base lg:text-2xl font-extrabold tracking-tight">Featured this week</h3>
          <Link to="/categories" className="text-[12px] lg:text-sm font-semibold text-emerald-600">See all</Link>
        </div>
        {loading ? <Skeleton /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {featured.slice(0, 5).map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        )}
      </section>

      {/* All products */}
      <section className="px-4 mt-6 max-w-7xl mx-auto lg:px-6 lg:mt-10">
        <div className="flex items-center justify-between mb-3 lg:mb-5">
          <h3 className="text-base lg:text-2xl font-extrabold tracking-tight">Fresh arrivals</h3>
        </div>
        {loading ? <Skeleton count={6} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {all.slice(0, 10).map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        )}
      </section>

      <div className="px-4 mt-6 lg:mt-12 max-w-7xl mx-auto lg:px-6 lg:pb-12">
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 lg:p-8 text-center">
          <Leaf className="w-5 h-5 lg:w-7 lg:h-7 text-emerald-600 mx-auto" />
          <div className="text-[13px] lg:text-lg font-semibold text-emerald-900 mt-1 lg:mt-2">Grown with care, delivered fresh</div>
          <div className="text-[11.5px] lg:text-sm text-emerald-700 mt-0.5">No pesticides • No preservatives • No artificial colours</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
