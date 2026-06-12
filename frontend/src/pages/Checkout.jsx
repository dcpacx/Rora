import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api, formatBDT } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import MobileHeader from '../components/MobileHeader';
import { Banknote, Smartphone, Wallet, MapPin, ChevronRight, Check, ShieldCheck, Copy, Info } from 'lucide-react';

const PaymentMethod = ({ label, selected, onClick, icon: Icon, color, sub }) => (
  <button type="button" onClick={onClick} className={`w-full rounded-2xl p-3.5 border-2 flex items-center gap-3 text-left transition-colors ${selected ? 'border-emerald-600 bg-emerald-50' : 'border-neutral-200 bg-white'}`}>
    <div className={`w-10 h-10 rounded-xl grid place-items-center ${color}`}><Icon className="w-5 h-5 text-white" /></div>
    <div className="flex-1">
      <div className="text-[13.5px] font-semibold text-neutral-900">{label}</div>
      <div className="text-[11.5px] text-neutral-500">{sub}</div>
    </div>
    <div className={`w-5 h-5 rounded-full border-2 grid place-items-center ${selected ? 'bg-emerald-600 border-emerald-600' : 'border-neutral-300'}`}>
      {selected && <Check className="w-3 h-3 text-white" />}
    </div>
  </button>
);

const Checkout = () => {
  const { cart, subtotal, delivery, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [step, setStep] = useState('details');
  const [method, setMethod] = useState('cod');
  const [addr, setAddr] = useState({ fullName: user?.name || '', phone: user?.phone || '', address: '', area: '', city: 'Dhaka', note: '' });
  const [pay, setPay] = useState({ senderPhone: user?.phone || '', txnId: '' });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({ bkashNumber: '', nagadNumber: '', instructions: '', bkashType: 'personal', nagadType: 'personal' });

  useEffect(() => {
    (async () => { try { const { data } = await api.get('/settings/payment'); setSettings(data); } catch (_) {} })();
  }, []);

  if (cart.length === 0 && !order) { nav('/cart'); return null; }

  const submitDetails = (e) => {
    e.preventDefault();
    if (!addr.fullName || !addr.phone || !addr.address || !addr.area) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' }); return;
    }
    setStep('payment');
  };

  const placeOrder = async () => {
    if (method !== 'cod') {
      if (!pay.senderPhone || pay.senderPhone.length < 11) { toast({ title: 'আপনার পাঠানো মোবাইল নম্বর দিন', variant: 'destructive' }); return; }
      if (!pay.txnId || pay.txnId.length < 6) { toast({ title: 'ট্রানজেকশন আইডি দিন', variant: 'destructive' }); return; }
    }
    setLoading(true);
    try {
      const items = cart.map((i) => ({ productId: i.id, name: i.name, image: i.image, price: i.price, qty: i.qty, unit: i.unit }));
      const { data } = await api.post('/orders', {
        items, address: addr, paymentMethod: method,
        paymentPhone: method !== 'cod' ? pay.senderPhone : null,
        paymentTxn: method !== 'cod' ? pay.txnId.trim() : null,
        subtotal, delivery, total,
      });
      setOrder(data);
      clearCart();
      setStep('done');
    } catch (e) {
      toast({ title: 'Order failed', description: e.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const copyNumber = (n) => { try { navigator.clipboard.writeText(n.replace(/\D/g, '')); toast({ title: 'Number copied' }); } catch (_) {} };

  if (step === 'done' && order) {
    return (
      <div className="pb-4 max-w-2xl mx-auto lg:px-6">
        <MobileHeader title="Order placed" />
        <div className="px-6 py-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 grid place-items-center">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-extrabold mt-4">ধন্যবাদ, {order.userName.split(' ')[0]}!</h2>
          <p className="text-sm text-neutral-500 mt-1">আপনার অর্ডার গ্রহণ করা হয়েছে।</p>
          {order.paymentMethod !== 'cod' && order.paymentStatus === 'pending' && (
            <div className="mt-3 inline-block bg-amber-50 text-amber-800 text-[12px] font-semibold px-3 py-1.5 rounded-full">পেমেন্ট ভেরিফিকেশনের অপেক্ষায়</div>
          )}
          <div className="mt-5 rounded-2xl border border-neutral-100 p-4 text-left text-sm">
            <div className="flex items-center justify-between"><span className="text-neutral-500">Order no.</span><span className="font-semibold">{order.orderNo}</span></div>
            <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">Total</span><span className="font-extrabold text-emerald-700">৳{formatBDT(order.total)}</span></div>
            <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">Payment</span><span className="font-semibold uppercase">{order.paymentMethod}</span></div>
            {order.paymentTxn && <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">TrxID</span><span className="font-mono text-xs">{order.paymentTxn}</span></div>}
          </div>
          <button onClick={() => nav(`/order/${order.id}`)} className="mt-6 w-full h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800">View order details</button>
          <button onClick={() => nav('/')} className="mt-2 w-full h-11 rounded-full bg-neutral-100 text-neutral-700 font-semibold hover:bg-neutral-200">Back to home</button>
        </div>
      </div>
    );
  }

  const officialNumber = method === 'bkash' ? settings.bkashNumber : method === 'nagad' ? settings.nagadNumber : '';
  const accountType = method === 'bkash' ? settings.bkashType : settings.nagadType;

  return (
    <div className="pb-28 lg:pb-12 max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Checkout" back hideSearch />

      {step === 'details' && (
        <form onSubmit={submitDetails} className="px-4 mt-3 space-y-3">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery address</div>
          <input value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} placeholder="Full name" className="w-full h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
          <input value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="Mobile number" inputMode="tel" className="w-full h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
          <textarea value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} placeholder="House / road / building" rows={2} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input value={addr.area} onChange={(e) => setAddr({ ...addr, area: e.target.value })} placeholder="Area / Thana" className="w-full h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
            <input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} placeholder="City" className="w-full h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
          </div>
          <textarea value={addr.note} onChange={(e) => setAddr({ ...addr, note: e.target.value })} placeholder="Note for rider (optional)" rows={2} className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-emerald-500 text-sm resize-none" />
          <button type="submit" className="w-full h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 mt-2 flex items-center justify-center gap-2">Continue to payment <ChevronRight className="w-4 h-4" /></button>
        </form>
      )}

      {step === 'payment' && (
        <div className="px-4 mt-3 space-y-3">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">Payment method</div>
          <PaymentMethod label="Cash on Delivery" sub="Pay when your order arrives" selected={method === 'cod'} onClick={() => setMethod('cod')} icon={Banknote} color="bg-neutral-800" />
          <PaymentMethod label="bKash (ক্লাসিক/Personal)" sub="Send money manually to our official number" selected={method === 'bkash'} onClick={() => setMethod('bkash')} icon={Smartphone} color="bg-pink-600" />
          <PaymentMethod label="Nagad" sub="Send money manually to our official number" selected={method === 'nagad'} onClick={() => setMethod('nagad')} icon={Wallet} color="bg-orange-500" />

          {(method === 'bkash' || method === 'nagad') && (
            <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[12.5px] text-emerald-900 leading-relaxed">{settings.instructions || `Send ৳${formatBDT(total)} to the number below using ${method === 'bkash' ? 'bKash' : 'Nagad'} “Send Money”, then enter the transaction ID.`}</div>
              </div>
              <div className="rounded-xl bg-white p-3.5 border border-emerald-200">
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-neutral-500">{method === 'bkash' ? 'bKash' : 'Nagad'} · {accountType}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="font-mono text-xl font-extrabold text-neutral-900">{officialNumber || 'Not set'}</div>
                  {officialNumber && (
                    <button type="button" onClick={() => copyNumber(officialNumber)} className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 hover:text-emerald-800">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  )}
                </div>
                <div className="mt-1.5 text-[11px] text-neutral-500">Amount to send: <span className="font-bold text-neutral-800">৳{formatBDT(total)}</span></div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase">Your {method === 'bkash' ? 'bKash' : 'Nagad'} number (sender) *</label>
                  <input value={pay.senderPhone} onChange={(e) => setPay({ ...pay, senderPhone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="tel" className="mt-1 w-full h-11 px-4 rounded-xl bg-white border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 uppercase">Transaction ID (TrxID) *</label>
                  <input value={pay.txnId} onChange={(e) => setPay({ ...pay, txnId: e.target.value.toUpperCase() })} placeholder="e.g. 8GH27AC4QY" className="mt-1 w-full h-11 px-4 rounded-xl bg-white border border-neutral-200 outline-none focus:border-emerald-500 text-sm font-mono" />
                  <div className="text-[10.5px] text-neutral-500 mt-1">Get this from your {method === 'bkash' ? 'bKash' : 'Nagad'} success SMS / app history.</div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-emerald-50 p-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-[12.5px]"><span className="text-neutral-600">Subtotal</span><span>৳{formatBDT(subtotal)}</span></div>
            <div className="flex items-center justify-between text-[12.5px]"><span className="text-neutral-600">Delivery</span><span>{delivery === 0 ? 'Free' : `৳${formatBDT(delivery)}`}</span></div>
            <div className="flex items-center justify-between font-bold"><span>Total</span><span className="text-emerald-700">৳{formatBDT(total)}</span></div>
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure checkout · manual verification within 15–30 minutes for mobile payments.</div>

          <div className="lg:hidden fixed bottom-16 inset-x-0 bg-white border-t border-neutral-100 px-4 py-3 z-30">
            <button disabled={loading} onClick={placeOrder} className="w-full h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60">
              {loading ? 'Placing order…' : `Confirm order · ৳${formatBDT(total)}`}
            </button>
          </div>
          <div className="hidden lg:block mt-4">
            <button disabled={loading} onClick={placeOrder} className="w-full h-12 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60">
              {loading ? 'Placing order…' : `Confirm order · ৳${formatBDT(total)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
