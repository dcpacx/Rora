import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatBDT } from '../lib/api';
import MobileHeader from '../components/MobileHeader';

const CartPage = () => {
  const { cart, updateQty, removeFromCart, subtotal, delivery, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <div className="pb-32">
      <MobileHeader title={`Cart (${cart.length})`} back />
      {cart.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 grid place-items-center">
            <ShoppingBag className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-lg font-extrabold mt-4">Your cart is empty</h2>
          <p className="text-sm text-neutral-500 mt-1">Add organic goodies to start your wellness journey.</p>
          <Link to="/" className="inline-flex mt-5 items-center gap-2 bg-emerald-600 text-white px-5 h-11 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors">Start shopping</Link>
        </div>
      ) : (
        <>
          <div className="px-4 mt-3 space-y-2">
            {cart.map((it) => (
              <div key={it.id} className="flex items-center gap-3 p-2.5 rounded-2xl border border-neutral-100">
                <img src={it.image} alt={it.name} onError={(e) => { e.currentTarget.src = `https://placehold.co/100/f5f5f5/525252?text=img`; }} className="w-16 h-16 rounded-xl object-cover bg-neutral-50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold line-clamp-2">{it.name}</div>
                  <div className="text-[11px] text-neutral-500">{it.unit}</div>
                  <div className="mt-0.5 text-[14px] font-extrabold text-emerald-700">৳{formatBDT(it.price * it.qty)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button onClick={() => removeFromCart(it.id)} className="w-7 h-7 grid place-items-center rounded-full text-neutral-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  <div className="flex items-center bg-emerald-50 rounded-full h-8">
                    <button onClick={() => updateQty(it.id, it.qty - 1)} className="w-7 h-full grid place-items-center text-emerald-700"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-xs font-bold text-emerald-700">{it.qty}</span>
                    <button onClick={() => updateQty(it.id, it.qty + 1)} className="w-7 h-full grid place-items-center text-emerald-700"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 mt-4">
            <div className="rounded-2xl bg-neutral-50 p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-neutral-600">Subtotal</span><span className="font-semibold">৳{formatBDT(subtotal)}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Delivery</span>
                <span className="font-semibold">{delivery === 0 ? <span className="text-emerald-600">Free</span> : `৳${formatBDT(delivery)}`}</span>
              </div>
              {delivery > 0 && (<div className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">Add ৳{formatBDT(500 - subtotal)} more for FREE delivery</div>)}
              <div className="border-t border-dashed border-neutral-200 my-1" />
              <div className="flex items-center justify-between text-base"><span className="font-semibold">Total</span><span className="font-extrabold text-emerald-700">৳{formatBDT(total)}</span></div>
            </div>
          </div>

          <div className="absolute bottom-16 inset-x-0 bg-white border-t border-neutral-100 px-4 py-3">
            <button onClick={() => nav(user ? '/checkout' : '/login?next=/checkout')} className="w-full h-12 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
              Proceed to checkout · ৳{formatBDT(total)}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
