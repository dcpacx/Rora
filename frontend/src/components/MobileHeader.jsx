import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, Bell, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const hideOnRoutes = ['/cart', '/profile', '/orders', '/categories'];

const MobileHeader = ({ title, back = false, hideSearch = false }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (title || back) {
    return (
      <div className="bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {back && (
            <button onClick={() => navigate(-1)} className="-ml-2 w-9 h-9 grid place-items-center rounded-full hover:bg-neutral-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-[17px] font-bold text-neutral-900 truncate max-w-[220px]">{title}</h1>
        </div>
        {!hideSearch && (
          <button onClick={() => navigate('/search')} className="w-9 h-9 grid place-items-center rounded-full hover:bg-neutral-100">
            <Search className="w-5 h-5 text-neutral-700" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-emerald-600 text-white px-4 pt-3 pb-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <div className="text-[11px] leading-tight">
            <div className="opacity-80">Deliver to</div>
            <div className="font-semibold">Dhaka 1209</div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-base font-extrabold tracking-tight">Sobuj <span className="font-light">•</span> সবুজ</div>
          <div className="text-[10px] opacity-80 -mt-0.5">Pure. Organic. Local.</div>
        </div>
        <button onClick={() => navigate(user ? '/profile' : '/login')} className="w-9 h-9 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 transition-colors">
          <Bell className="w-4.5 h-4.5" />
        </button>
      </div>
      <button onClick={() => navigate('/search')} className="mt-3 w-full h-11 rounded-full bg-white text-neutral-500 px-4 flex items-center gap-2 text-sm">
        <Search className="w-4 h-4" />
        <span>Search for honey, oil, spices…</span>
      </button>
    </div>
  );
};

export default MobileHeader;
