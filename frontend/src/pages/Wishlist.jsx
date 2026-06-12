import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useShop } from '../contexts/ShopContext';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { wishlist } = useShop();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto px-4 mt-20 mb-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 grid place-items-center">
          <Heart className="w-7 h-7 text-neutral-500" />
        </div>
        <h1 className="text-2xl font-extrabold mt-5">Your wishlist is empty</h1>
        <p className="text-sm text-neutral-500 mt-1">Tap the heart on any product to save it for later.</p>
        <Link to="/" className="inline-flex mt-6 items-center gap-2 bg-neutral-900 text-white px-5 h-11 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 mt-6 mb-16">
      <h1 className="text-2xl font-extrabold tracking-tight">Wishlist ({wishlist.length})</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">Items you’ve saved — add them to cart anytime.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {wishlist.map((p) => (<ProductCard key={p.id} product={p} />))}
      </div>
    </div>
  );
};

export default WishlistPage;
