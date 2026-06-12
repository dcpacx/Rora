import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Leaf } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatBDT } from '../lib/api';
import { useToast } from '../hooks/use-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const add = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(product, 1);
    toast({ title: 'Added to cart', description: product.name });
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card block rounded-2xl bg-white border border-neutral-100 overflow-hidden">
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        {product.discount ? (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{product.discount}%</span>
        ) : null}
        {product.organic && (
          <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-700 text-[9.5px] font-semibold px-1.5 py-0.5 rounded">
            <Leaf className="w-2.5 h-2.5" /> Organic
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = `https://placehold.co/400x400/f5f5f5/525252?text=${encodeURIComponent(product.name.slice(0,16))}`; }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2.5 space-y-1">
        <h3 className="text-[13px] font-semibold leading-snug text-neutral-900 line-clamp-2 min-h-[34px]">{product.name}</h3>
        <div className="text-[11px] text-neutral-500">{product.unit}</div>
        <div className="flex items-end justify-between pt-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[14px] font-extrabold text-neutral-900">৳{formatBDT(product.price)}</span>
              {product.oldPrice && (<span className="text-[11px] text-neutral-400 line-through">৳{formatBDT(product.oldPrice)}</span>)}
            </div>
          </div>
          <button onClick={add} className="w-8 h-8 rounded-full bg-emerald-600 text-white grid place-items-center hover:bg-emerald-700 transition-colors active:scale-95">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
