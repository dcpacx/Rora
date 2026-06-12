import React from 'react';
import { MapPin, Bell, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopBar = () => {
  return (
    <div className="w-full bg-neutral-950 text-neutral-300 text-[12.5px]">
      <div className="max-w-[1280px] mx-auto px-4 h-9 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span>Deliver to</span>
            <span className="font-semibold text-white">Dhaka 1209</span>
          </div>
          <Link to="/" className="hover:text-white transition-colors">Sell on Evaly</Link>
          <Link to="/" className="hover:text-white transition-colors">Track order</Link>
          <Link to="/" className="hover:text-white transition-colors">Help center</Link>
        </div>
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>
          <span className="text-neutral-500">|</span>
          <button className="hover:text-white transition-colors">বাংলা / <span className="text-white">EN</span></button>
          <button className="flex items-center gap-1 hover:text-white transition-colors">
            <span className="text-white font-semibold">BDT</span>
            <span>৳</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
