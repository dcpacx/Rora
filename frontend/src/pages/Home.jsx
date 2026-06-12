import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, BadgeDollarSign, Flame, CheckCircle2, ShieldCheck, Apple, Play } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, stores, brands, promoCards, trendingTabs } from '../mock';

const SectionHeader = ({ kicker, title, action }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      <div className="text-[12.5px] font-semibold uppercase tracking-wider text-red-600">{kicker}</div>
      <h2 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-neutral-900 mt-1">{title}</h2>
    </div>
    {action}
  </div>
);

const Hero = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    {/* Main banner */}
    <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-neutral-950 text-white min-h-[340px] p-8 md:p-12 flex flex-col justify-between">
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage:
          'radial-gradient(circle at 80% 30%, rgba(239,44,44,0.25) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(59,130,246,0.18) 0%, transparent 45%)',
      }} />
      <div className="relative">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3">Marketplace</div>
        <h1 className="text-4xl md:text-[56px] leading-[1.02] font-extrabold tracking-tight max-w-[520px]">
          Bangladesh’s<br />Marketplace
        </h1>
        <p className="mt-4 text-neutral-300 text-base md:text-lg max-w-md">Millions of products, one place.</p>
      </div>
      <div className="relative">
        <Link to="/category/electronics-audio" className="inline-flex items-center gap-2 bg-white text-neutral-900 px-5 h-11 rounded-full text-sm font-semibold hover:bg-neutral-100 transition-colors">
          Shop now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Decorative card */}
      <div className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 w-[260px] aspect-square rounded-2xl bg-white/95 text-neutral-900 p-5 flex-col justify-between shadow-2xl rotate-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Product</div>
          <div className="mt-1 font-semibold leading-tight">Bangladesh’s<br />Marketplace</div>
        </div>
        <div className="h-32 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 grid place-items-center">
          <div className="w-full h-full opacity-70" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(125, 211, 252, 0.5) 0 8px, transparent 8px 18px)',
            borderRadius: '0.75rem',
          }} />
        </div>
      </div>
    </div>

    {/* Side cards */}
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-rose-100 p-6 flex items-start justify-between min-h-[160px] relative overflow-hidden">
        <div>
          <h3 className="text-xl font-extrabold text-neutral-900">Cash on Delivery</h3>
          <p className="text-sm text-neutral-700 mt-1 max-w-[200px]">Pay in cash when your order arrives</p>
          <Link to="/category/fashion" className="inline-flex items-center gap-1.5 text-sm font-semibold mt-4 bg-white px-3 h-8 rounded-full hover:bg-neutral-100 transition-colors">Shop now <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="w-12 h-12 rounded-md bg-red-500 grid place-items-center shrink-0">
          <BadgeDollarSign className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="rounded-2xl bg-sky-100 p-6 flex items-start justify-between min-h-[160px] relative overflow-hidden">
        <div>
          <h3 className="text-xl font-extrabold text-neutral-900">Free Delivery</h3>
          <p className="text-sm text-neutral-700 mt-1">On orders over ৳1,000</p>
          <Link to="/category/electronics-audio" className="inline-flex items-center gap-1.5 text-sm font-semibold mt-4 bg-white px-3 h-8 rounded-full hover:bg-neutral-100 transition-colors">Shop now <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-600 grid place-items-center shrink-0">
          <Truck className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  </div>
);

const ProductGrid = ({ kicker, title, subtitle, items, action }) => {
  const [tab, setTab] = useState(trendingTabs[0]);
  return (
    <section className="max-w-[1280px] mx-auto px-4 mt-14">
      <SectionHeader kicker={kicker} title={title} action={action} />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <p className="text-sm text-neutral-500">{subtitle}</p>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-[12.5px] text-red-600 font-semibold whitespace-nowrap">
            <Flame className="w-3.5 h-3.5" /> Trending now
          </div>
          {trendingTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[12.5px] px-3 h-8 rounded-full whitespace-nowrap transition-colors ${tab === t ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((p) => (<ProductCard key={p.id} product={p} />))}
      </div>
    </section>
  );
};

const PromoCards = () => (
  <section className="max-w-[1280px] mx-auto px-4 mt-14">
    <SectionHeader kicker="Editor’s edit" title="Curated for you" />
    <p className="text-sm text-neutral-500 -mt-3 mb-6">Hand-picked collections from Evaly’s merchandising team — refreshed weekly.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {promoCards.map((p) => (
        <Link key={p.title} to={p.href} className="group relative rounded-2xl overflow-hidden aspect-[16/7] block">
          <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className={`absolute inset-0 bg-gradient-to-tr ${p.overlay} from-black/60 via-black/30 to-transparent`} />
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <div className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">{p.title}</div>
            <div className="text-white/80 text-sm mt-1 group-hover:underline">Explore the edit →</div>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

const FeaturedStores = () => (
  <section className="max-w-[1280px] mx-auto px-4 mt-14">
    <SectionHeader
      kicker="Shop with confidence"
      title="Featured stores · Verified sellers"
      action={<Link to="/search" className="text-sm font-semibold text-neutral-700 hover:text-red-600 flex items-center gap-1">Browse all stores <ArrowRight className="w-4 h-4" /></Link>}
    />
    <p className="text-sm text-neutral-500 -mt-3 mb-6">Hand-picked verified stores — every product backed by our 7-day return guarantee.</p>
    <div className="rounded-2xl border border-neutral-100 p-4 bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {stores.map((s) => (
          <Link key={s.slug} to={`/search?q=${encodeURIComponent(s.name)}`} className="chip flex flex-col items-start gap-1 p-3 rounded-xl bg-neutral-50 border border-transparent">
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700"><ShieldCheck className="w-3 h-3" /> Verified</span>
            <span className="text-[13px] font-semibold text-neutral-900 leading-tight">{s.name}</span>
            <span className="text-[11px] text-neutral-500">{s.products} products</span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const SellerCTA = () => (
  <section className="max-w-[1280px] mx-auto px-4 mt-14">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-10 relative overflow-hidden">
        <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">For business</div>
        <h3 className="text-3xl font-extrabold mt-2 leading-tight">Start selling on Evaly</h3>
        <p className="text-neutral-300 text-sm mt-3 max-w-md">Reach shoppers nationwide, manage your products and orders, and get secured 7-day payouts to bKash.</p>
        <button className="mt-6 inline-flex items-center gap-2 bg-white text-neutral-900 px-5 h-11 rounded-full text-sm font-semibold hover:bg-neutral-100 transition-colors">Sell on Evaly <ArrowRight className="w-4 h-4" /></button>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 p-10 relative overflow-hidden">
        <div className="text-[11px] uppercase tracking-[0.2em] text-red-600 font-semibold">Get the app</div>
        <h3 className="text-2xl md:text-3xl font-extrabold mt-2 leading-tight text-neutral-900">Shop faster with the Evaly app — ৳100 off your first order.</h3>
        <p className="text-neutral-600 text-sm mt-3 max-w-md">Scan-to-pay with bKash, track your delivery in real time, and unlock app-only flash sales every Friday at 9 PM.</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <button className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 h-11 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors">
            <Apple className="w-4 h-4" />
            <div className="text-left leading-tight">
              <div className="text-[9px] font-normal opacity-80">Download on</div>
              <div className="text-[13px]">App Store</div>
            </div>
          </button>
          <button className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 h-11 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors">
            <Play className="w-4 h-4" />
            <div className="text-left leading-tight">
              <div className="text-[9px] font-normal opacity-80">Get it on</div>
              <div className="text-[13px]">Google Play</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
);

const BrandStrip = () => (
  <section className="max-w-[1280px] mx-auto px-4 mt-14">
    <SectionHeader
      kicker="Shop by brand"
      title="Featured brands"
      action={<Link to="/search" className="text-sm font-semibold text-neutral-700 hover:text-red-600 flex items-center gap-1">Browse all <ArrowRight className="w-4 h-4" /></Link>}
    />
    <p className="text-sm text-neutral-500 -mt-3 mb-6">Authentic products from official and verified brand partners.</p>
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {brands.map((b) => (
        <Link key={b.slug} to={`/search?q=${b.slug}`} className="aspect-[3/2] rounded-xl border border-neutral-100 bg-white grid place-items-center p-4 hover:border-neutral-300 transition-colors">
          {b.logo ? (
            <img src={b.logo} alt={b.name} className="max-h-10 object-contain grayscale hover:grayscale-0 transition-all" />
          ) : (
            <span className="font-extrabold tracking-tight text-neutral-700 text-sm">{b.name}</span>
          )}
        </Link>
      ))}
    </div>
  </section>
);

const Home = () => {
  const bestSellers = products.slice(0, 10);
  const newArrivals = [...products].reverse().slice(0, 10);
  return (
    <div className="pb-4">
      <section className="max-w-[1280px] mx-auto px-4 mt-5">
        <Hero />
      </section>

      <ProductGrid
        kicker="What everyone’s buying"
        title="Best sellers this week"
        subtitle="Ranked by verified purchases & customer reviews — updated every Monday."
        items={bestSellers}
        action={<Link to="/category/electronics-audio" className="text-sm font-semibold text-neutral-700 hover:text-red-600 flex items-center gap-1">View leaderboard <ArrowRight className="w-4 h-4" /></Link>}
      />

      <PromoCards />
      <FeaturedStores />

      <ProductGrid
        kicker="What everyone’s buying"
        title="New arrivals"
        subtitle="Freshly listed by verified sellers — grab them before they’re gone."
        items={newArrivals}
        action={<Link to="/category/fashion" className="text-sm font-semibold text-neutral-700 hover:text-red-600 flex items-center gap-1">View leaderboard <ArrowRight className="w-4 h-4" /></Link>}
      />

      <SellerCTA />
      <BrandStrip />

      <div className="max-w-[1280px] mx-auto px-4 mt-12 flex items-center justify-center gap-2 text-xs text-neutral-500">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> All transactions are secured & buyer-protected.
      </div>
    </div>
  );
};

export default Home;
