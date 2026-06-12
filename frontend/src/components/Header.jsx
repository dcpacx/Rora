import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, ChevronDown } from 'lucide-react';
import { useShop } from '../contexts/ShopContext';
import { categories } from '../mock';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

const Header = () => {
  const { cartCount, wishlist } = useShop();
  const [q, setQ] = useState('');
  const [scope, setScope] = useState('All');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="w-full bg-white border-b border-neutral-100">
      <div className="max-w-[1280px] mx-auto px-4 h-[72px] flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center select-none">
          <span className="text-[28px] font-extrabold tracking-tight" style={{ color: '#ef2c2c', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>evaly</span>
        </Link>

        {/* Search */}
        <form onSubmit={submit} className="flex-1">
          <div className="flex items-center h-12 rounded-full bg-neutral-100 border border-neutral-200 hover:border-neutral-300 focus-within:border-neutral-400 transition-colors overflow-hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-1 px-4 h-full text-sm text-neutral-700 hover:bg-neutral-200/60 transition-colors">
                  <span className="font-medium">{scope}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Search scope</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setScope('All')}>All</DropdownMenuItem>
                {categories.slice(0, 8).map((c) => (
                  <DropdownMenuItem key={c.slug} onClick={() => setScope(c.name)}>{c.name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-px h-6 bg-neutral-300" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phones, beauty, home & more…"
              className="flex-1 h-full bg-transparent px-4 text-[15px] outline-none placeholder:text-neutral-500"
            />
            <button type="submit" className="flex items-center gap-2 h-9 mr-1.5 px-4 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <button className="flex flex-col items-center px-3 py-1 rounded-lg hover:bg-neutral-100 transition-colors">
            <User className="w-5 h-5 text-neutral-700" />
            <span className="text-[11px] text-neutral-600 mt-0.5">Sign in</span>
          </button>
          <Link to="/wishlist" className="flex flex-col items-center px-3 py-1 rounded-lg hover:bg-neutral-100 transition-colors relative">
            <Heart className="w-5 h-5 text-neutral-700" />
            <span className="text-[11px] text-neutral-600 mt-0.5">Wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">{wishlist.length}</span>
            )}
          </Link>
          <Link to="/cart" className="flex flex-col items-center px-3 py-1 rounded-lg hover:bg-neutral-100 transition-colors relative">
            <ShoppingCart className="w-5 h-5 text-neutral-700" />
            <span className="text-[11px] text-neutral-600 mt-0.5">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
