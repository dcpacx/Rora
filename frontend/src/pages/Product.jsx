import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, formatBDT } from '../lib/api';
import { Minus, Plus, Leaf, Truck, ShieldCheck, RotateCcw, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/use-toast';
import MobileHeader from '../components/MobileHeader';

const ProductPage = () => {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const nav = useNavigate();

  useEffect(() => { (async () => {
    try { const { data } = await api.get(`/products/${slug}`); setP(data); } catch (_) { /* not found */ }
  })(); }, [slug]);

  if (!p) return (<div className="p-8 text-center text-sm text-neutral-500">Loading product…</div>);

  const add = () => { addToCart(p, qty); toast({ title: 'Added to cart', description: `${qty} × ${p.name}` }); };
  const buy = () => { addToCart(p, qty); nav('/cart'); };

  return (
    <div className="pb-28 lg:pb-12">
      <MobileHeader title=" " back />
      <div className="max-w-7xl mx-auto lg:px-6 lg:py-8 lg:grid lg:grid-cols-2 lg:gap-10">
        <div className="aspect-square bg-neutral-50 lg:rounded-3xl lg:overflow-hidden">
          <img src={p.image} alt={p.name} onError={(e) => { e.currentTarget.src = `https://placehold.co/600/f5f5f5/525252?text=${encodeURIComponent(p.name.slice(0,16))}`; }} className="w-full h-full object-cover" />
        </div>
        <div className="px-4 mt-4 lg:mt-0 lg:px-0">
          <div className="flex items-center gap-2 mb-1">
            {p.organic && (<span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5 rounded"><Leaf className="w-2.5 h-2.5" /> Organic</span>)}
            <span className="text-[11px] text-neutral-500">{p.unit}</span>
          </div>
          <h1 className="text-xl lg:text-3xl font-extrabold leading-tight text-neutral-900">{p.name}</h1>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl lg:text-4xl font-extrabold text-neutral-900">৳{formatBDT(p.price)}</span>
            {p.oldPrice && (<><span className="text-sm lg:text-lg text-neutral-400 line-through">৳{formatBDT(p.oldPrice)}</span><span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">-{p.discount}%</span></>)}
          </div>

          {p.tags && p.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {p.tags.map((t, i) => (<span key={i} className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">#{t}</span>))}
            </div>
          )}

          <p className="text-[13.5px] lg:text-base text-neutral-600 leading-relaxed mt-4">{p.description}</p>

          <div className="mt-5 grid grid-cols-3 gap-2 lg:gap-3">
            {[
              { i: Truck, t: 'Free delivery', s: 'Over ৳500' },
              { i: ShieldCheck, t: 'Quality', s: '100% organic' },
              { i: RotateCcw, t: 'Easy return', s: '24 hrs' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl bg-neutral-50 p-2.5 lg:p-3.5 text-center">
                <f.i className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 mx-auto" />
                <div className="text-[11px] lg:text-sm font-semibold text-neutral-900 mt-1 leading-tight">{f.t}</div>
                <div className="text-[10px] lg:text-xs text-neutral-500">{f.s}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 p-3">
            <span className="text-sm font-medium text-neutral-700">Quantity</span>
            <div className="flex items-center bg-white border border-neutral-200 rounded-full h-10">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-full grid place-items-center text-neutral-700"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-10 h-full grid place-items-center text-neutral-700"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Desktop action buttons (inline) */}
          <div className="hidden lg:flex items-center gap-3 mt-6">
            <button data-testid="product-add-to-cart" onClick={add} className="flex-1 h-12 rounded-full border border-emerald-600 text-emerald-700 font-semibold inline-flex items-center justify-center gap-2 hover:bg-emerald-50">
              <ShoppingBag className="w-4 h-4" /> Add to cart
            </button>
            <button data-testid="product-buy-now" onClick={buy} className="flex-1 h-12 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Buy now</button>
          </div>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 bg-white border-t border-neutral-100 px-4 py-3 flex items-center gap-2 z-30">
        <button data-testid="product-add-to-cart-mobile" onClick={add} className="flex-1 h-12 rounded-full border border-emerald-600 text-emerald-700 font-semibold inline-flex items-center justify-center gap-2 hover:bg-emerald-50">
          <ShoppingBag className="w-4 h-4" /> Add to cart
        </button>
        <button data-testid="product-buy-now-mobile" onClick={buy} className="flex-1 h-12 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Buy now</button>
      </div>
    </div>
  );
};

export default ProductPage;
