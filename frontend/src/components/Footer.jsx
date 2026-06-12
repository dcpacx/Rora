import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter, Truck, ShieldCheck, RotateCcw, Smartphone } from 'lucide-react';
import { categories } from '../mock';

const Footer = () => {
  return (
    <footer className="bg-neutral-950 text-neutral-300 mt-16">
      {/* Trust strip */}
      <div className="border-b border-neutral-800">
        <div className="max-w-[1280px] mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Nationwide delivery', desc: 'Across all 64 districts' },
            { icon: ShieldCheck, title: 'Buyer protection', desc: 'Verified sellers & secure pay' },
            { icon: RotateCcw, title: 'Easy returns', desc: '7-day return guarantee' },
            { icon: Smartphone, title: 'Shop on the app', desc: 'iOS & Android' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 grid place-items-center">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{item.title}</div>
                <div className="text-xs text-neutral-400 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="text-3xl font-extrabold text-red-500 tracking-tight" style={{ letterSpacing: '-0.04em' }}>evaly</div>
          <p className="text-sm text-neutral-400 mt-3 max-w-sm">
            Bangladesh’s online marketplace. Millions of products from verified sellers — cash on delivery, 7-day returns, nationwide shipping.
          </p>
          <div className="flex items-center gap-2 mt-5">
            {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-red-600 grid place-items-center transition-colors">
                <Icon className="w-4 h-4 text-white" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-white font-semibold mb-3 text-sm">Categories</div>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}><Link to={`/category/${c.slug}`} className="hover:text-white transition-colors">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-3 text-sm">For customers</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Track order</Link></li>
            <li><Link to="/" className="hover:text-white">Help center</Link></li>
            <li><Link to="/" className="hover:text-white">Returns & refunds</Link></li>
            <li><Link to="/" className="hover:text-white">Buyer protection</Link></li>
            <li><Link to="/" className="hover:text-white">Contact us</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-3 text-sm">For business</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">Sell on Evaly</Link></li>
            <li><Link to="/" className="hover:text-white">Seller center</Link></li>
            <li><Link to="/" className="hover:text-white">Advertise</Link></li>
            <li><Link to="/" className="hover:text-white">Affiliate program</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="max-w-[1280px] mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>© {new Date().getFullYear()} Evaly Clone — For design demo purposes only.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
