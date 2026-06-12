import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useShop } from '../contexts/ShopContext';
import { formatBDT } from '../mock';

const CartPage = () => {
  const { cart, updateQty, removeFromCart, cartTotal, clearCart } = useShop();
  const delivery = cartTotal > 0 && cartTotal < 1000 ? 60 : 0;
  const grand = cartTotal + delivery;

  if (cart.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto px-4 mt-20 mb-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 grid place-items-center">
          <ShoppingBag className="w-7 h-7 text-neutral-500" />
        </div>
        <h1 className="text-2xl font-extrabold mt-5">Your cart is empty</h1>
        <p className="text-sm text-neutral-500 mt-1">Browse millions of products from verified sellers and add your favourites to the cart.</p>
        <Link to="/" className="inline-flex mt-6 items-center gap-2 bg-neutral-900 text-white px-5 h-11 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 mt-6 mb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold tracking-tight">Your cart ({cart.length})</h1>
          <button onClick={clearCart} className="text-xs text-neutral-500 hover:text-red-600">Clear all</button>
        </div>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl border border-neutral-100">
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-neutral-50" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] text-neutral-500">{item.store}</div>
                <Link to={`/product/${item.slug}`} className="text-sm font-semibold text-neutral-900 line-clamp-2 hover:text-red-600">{item.name}</Link>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[15px] font-bold">৳{formatBDT(item.price)}</span>
                  {item.oldPrice && <span className="text-xs text-neutral-400 line-through">৳{formatBDT(item.oldPrice)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-200 rounded-full h-9">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-full grid place-items-center text-neutral-700"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-full grid place-items-center text-neutral-700"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="w-9 h-9 grid place-items-center rounded-full text-neutral-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-neutral-100 p-6 h-fit lg:sticky lg:top-20">
        <h2 className="text-lg font-extrabold mb-4">Order summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between"><span className="text-neutral-600">Subtotal</span><span className="font-semibold">৳{formatBDT(cartTotal)}</span></div>
          <div className="flex items-center justify-between"><span className="text-neutral-600">Delivery</span><span className="font-semibold">{delivery === 0 ? <span className="text-emerald-600">Free</span> : `৳${formatBDT(delivery)}`}</span></div>
          <div className="border-t border-dashed border-neutral-200 my-3" />
          <div className="flex items-center justify-between text-base"><span className="font-semibold">Total</span><span className="font-extrabold">৳{formatBDT(grand)}</span></div>
        </div>
        <button className="mt-5 w-full h-12 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">Proceed to checkout</button>
        <div className="mt-4 space-y-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-emerald-600" /> Free delivery on orders over ৳1,000.</div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Buyer protection · 7-day returns.</div>
        </div>
      </aside>
    </div>
  );
};

export default CartPage;
