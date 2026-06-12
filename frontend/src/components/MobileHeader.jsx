import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, Bell, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotifContext';

const MobileHeader = ({ title, back = false, hideSearch = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unread } = useNotifications();

  if (title || back) {
    return (
      <div className="lg:hidden bg-white border-b border-neutral-100 px-4 h-14 flex items-center justify-between sticky top-0 z-30">
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

  // Home header — user profile left, notification bell right (no title)
  return (
    <div className="lg:hidden bg-emerald-600 text-white px-4 pt-3 pb-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <Link to={user ? '/profile' : '/login'} className="flex items-center gap-2 -ml-1 pr-2 py-0.5 rounded-full hover:bg-white/10 transition-colors">
          <div className="w-9 h-9 rounded-full bg-white/20 grid place-items-center text-sm font-extrabold">
            {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="leading-tight text-left">
            <div className="text-[10.5px] opacity-80">{user ? 'Welcome back' : 'Tap to'}</div>
            <div className="text-[13px] font-semibold truncate max-w-[160px]">{user ? user.name : 'Sign in'}</div>
          </div>
        </Link>
        <button onClick={() => navigate('/notifications')} className="relative w-10 h-10 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-emerald-600">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
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
