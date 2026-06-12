import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Truck } from 'lucide-react';
import { categories } from '../mock';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';

const CategoryNav = () => {
  return (
    <div className="w-full bg-white border-b border-neutral-100 sticky top-0 z-30">
      <div className="max-w-[1280px] mx-auto px-4 h-14 flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 h-10 px-4 rounded-full bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors shrink-0">
              <Menu className="w-4 h-4" />
              All Categories
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {categories.map((c) => (
              <DropdownMenuItem asChild key={c.slug}>
                <Link to={`/category/${c.slug}`}>{c.name}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1">
            {categories.slice(0, 10).map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="cat-link whitespace-nowrap text-[13.5px] font-medium text-neutral-700 px-3 py-2 rounded-md hover:bg-neutral-50"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/search?q=flash%20sale" className="whitespace-nowrap text-[13.5px] font-semibold text-red-600 px-3 py-2 rounded-md hover:bg-red-50">
              Flash Sale
            </Link>
          </div>
        </div>

        <div className="shrink-0 hidden md:flex items-center gap-1.5 text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
          <Truck className="w-3.5 h-3.5" />
          Free Delivery ৳999+
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
