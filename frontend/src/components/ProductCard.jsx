import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check } from 'lucide-react';
import { useShop } from '../contexts/ShopContext';
import { formatBDT } from '../mock';
import { useToast } from '../hooks/use-toast';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const wished = isWishlisted(product.id);
  const { toast } = useToast();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast({ title: 'Added to cart', description: product.name });
  };

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card group block rounded-2xl bg-white border border-neutral-100 overflow-hidden">
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        {product.discount && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">-{product.discount}%</span>
        )}
        <button onClick={handleWish} className={`wish-btn absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full grid place-items-center ${wished ? 'bg-red-500 text-white' : 'bg-white/95 text-neutral-700 hover:bg-white'}`}>
          <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
        </button>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = `https://placehold.co/600x600/f5f5f5/525252?text=${encodeURIComponent(product.name.slice(0,20))}`; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={handleAdd}
          className="absolute bottom-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 bg-neutral-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-neutral-800"
        >
          Add to Cart
        </button>
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1 text-[11.5px] text-neutral-500">
          <span className="truncate">{product.store}</span>
          {product.verified && (
            <span className="flex items-center gap-0.5 text-emerald-600">
              <Check className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
        <h3 className="text-[13.5px] leading-snug text-neutral-900 line-clamp-2 min-h-[34px] group-hover:text-red-600 transition-colors">{product.name}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-neutral-900">৳{formatBDT(product.price)}</span>
          {product.oldPrice && (
            <>
              <span className="text-[12px] text-neutral-400 line-through">৳{formatBDT(product.oldPrice)}</span>
              <span className="text-[11px] font-semibold text-red-600">-{product.discount}%</span>
            </>
          )}
        </div>
        {product.isNew && (
          <span className="inline-block text-[10.5px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">New</span>
        )}
        {product.freeDelivery && (
          <div className="pt-1.5 border-t border-dashed border-neutral-200 flex items-center justify-between text-[11px] text-emerald-700">
            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Free delivery</span>
            <span className="text-neutral-500">In 2–3 days</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
