import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Heart, ShieldCheck, Truck, RotateCcw, Star, Minus, Plus, Check } from 'lucide-react';
import { products, formatBDT } from '../mock';
import { useShop } from '../contexts/ShopContext';
import { useToast } from '../hooks/use-toast';
import ProductCard from '../components/ProductCard';

const ProductPage = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug) || products[0];
  const [qty, setQty] = useState(1);
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const wished = isWishlisted(product.id);
  const { toast } = useToast();
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 5);

  const add = () => {
    addToCart(product, qty);
    toast({ title: 'Added to cart', description: `${qty} × ${product.name}` });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 mt-6">
      <div className="text-xs text-neutral-500 flex items-center gap-1 mb-5">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/category/${product.category}`} className="hover:text-neutral-900 capitalize">{product.category.replace('-', ' & ')}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-900 font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="rounded-2xl bg-neutral-50 aspect-square overflow-hidden">
          <img src={product.image} alt={product.name} onError={(e) => { e.currentTarget.src = `https://placehold.co/800x800/f5f5f5/525252?text=${encodeURIComponent(product.name.slice(0,20))}`; }} className="w-full h-full object-cover" />
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-700 font-medium">{product.store}</span>
            {product.verified && (<span className="flex items-center gap-0.5 text-emerald-600 text-xs"><Check className="w-3 h-3" /> Verified</span>)}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 mt-1.5">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-neutral-600">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {product.rating}</span>
            <span className="text-neutral-300">|</span>
            <span>{product.sold?.toLocaleString()} sold</span>
          </div>

          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-3xl font-extrabold text-neutral-900">৳{formatBDT(product.price)}</span>
            {product.oldPrice && (<>
              <span className="text-lg text-neutral-400 line-through">৳{formatBDT(product.oldPrice)}</span>
              <span className="text-sm font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">-{product.discount}%</span>
            </>)}
          </div>

          <p className="text-sm text-neutral-600 mt-5 leading-relaxed">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-neutral-200 rounded-full h-12">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-full grid place-items-center text-neutral-700 hover:text-neutral-900"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-11 h-full grid place-items-center text-neutral-700 hover:text-neutral-900"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={add} className="flex-1 h-12 rounded-full bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors">Add to cart</button>
            <button onClick={() => toggleWishlist(product)} className={`w-12 h-12 grid place-items-center rounded-full border ${wished ? 'bg-red-500 text-white border-red-500' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>
              <Heart className={`w-5 h-5 ${wished ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            {[{ i: Truck, t: 'Free delivery', s: 'In 2–3 days' }, { i: ShieldCheck, t: 'Buyer protection', s: 'Secure pay' }, { i: RotateCcw, t: '7-day returns', s: 'No questions' }].map((f, i) => (
              <div key={i} className="rounded-xl bg-neutral-50 p-3 flex items-center gap-3">
                <f.i className="w-5 h-5 text-neutral-700" />
                <div>
                  <div className="text-[13px] font-semibold text-neutral-900 leading-tight">{f.t}</div>
                  <div className="text-[11px] text-neutral-500">{f.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 mb-5">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
