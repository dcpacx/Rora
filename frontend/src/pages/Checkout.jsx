import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api, formatBDT } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import MobileHeader from '../components/MobileHeader';
import { Banknote, Smartphone, Wallet, MapPin, ChevronRight, Check, ShieldCheck } from 'lucide-react';

const PaymentMethod = ({ id, label, selected, onClick, icon: Icon, color, sub }) => (
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
  const [step, setStep] = useState('details'); // details | payment | otp | done
  const [method, setMethod] = useState('cod');
  const [addr, setAddr] = useState({ fullName: user?.name || '', phone: user?.phone || '', address: '', area: '', city: 'Dhaka', note: '' });
  const [payPhone, setPayPhone] = useState(user?.phone || '');
  const [otp, setOtp] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  if (cart.length === 0 && !order) { nav('/cart'); return null; }

  const submitDetails = (e) => {
    e.preventDefault();
    if (!addr.fullName || !addr.phone || !addr.address || !addr.area) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' }); return;
    }
    setStep('payment');
  };

  const placeOrder = async (txn = null) => {
    setLoading(true);
    try {
      const items = cart.map((i) => ({ productId: i.id, name: i.name, image: i.image, price: i.price, qty: i.qty, unit: i.unit }));
      const { data } = await api.post('/orders', { items, address: addr, paymentMethod: method, paymentPhone: method !== 'cod' ? payPhone : null, paymentTxn: txn, subtotal, delivery, total });
      setOrder(data);
      clearCart();
      setStep('done');
    } catch (e) {
      toast({ title: 'Order failed', description: e.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const initiatePayment = async () => {
    if (method === 'cod') return placeOrder();
    if (!payPhone || payPhone.length < 11) { toast({ title: 'Enter valid mobile number', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/payments/initiate', { method, phone: payPhone, amount: total });
      setSession(data);
      setStep('otp');
      toast({ title: 'OTP sent', description: data.message });
    } catch (e) {
      toast({ title: 'Payment failed', description: e.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) { toast({ title: 'Enter the 4-digit OTP', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/payments/verify', { sessionId: session.sessionId, otp });
      toast({ title: 'Payment successful', description: `Txn: ${data.txnId}` });
      await placeOrder(data.txnId);
    } catch (e) {
      toast({ title: 'Invalid OTP', description: e.response?.data?.detail || 'Try 1234 (demo)', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  if (step === 'done' && order) {
    return (
      <div className="pb-4">
        <MobileHeader title="Order placed" />
        <div className="px-6 py-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 grid place-items-center">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-extrabold mt-4">Thank you, {order.userName.split(' ')[0]}!</h2>
          <p className="text-sm text-neutral-500 mt-1">Your order has been received.</p>
          <div className="mt-5 rounded-2xl border border-neutral-100 p-4 text-left text-sm">
            <div className="flex items-center justify-between"><span className="text-neutral-500">Order no.</span><span className="font-semibold">{order.orderNo}</span></div>
            <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">Total</span><span className="font-extrabold text-emerald-700">৳{formatBDT(order.total)}</span></div>
            <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">Payment</span><span className="font-semibold uppercase">{order.paymentMethod}</span></div>
            {order.paymentTxn && <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">Txn</span><span className="font-mono text-xs">{order.paymentTxn}</span></div>}
            <div className="flex items-center justify-between mt-1"><span className="text-neutral-500">Status</span><span className="font-semibold capitalize text-amber-600">{order.status}</span></div>
          </div>
          <button onClick={() => nav('/orders')} className="mt-6 w-full h-12 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700">View my orders</button>
          <button onClick={() => nav('/')} className="mt-2 w-full h-11 rounded-full bg-neutral-100 text-neutral-700 font-semibold hover:bg-neutral-200">Back to home</button>
        </div>
      </div>
    );
  }

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
          <button type="submit" className="w-full h-12 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 mt-2 flex items-center justify-center gap-2">Continue to payment <ChevronRight className="w-4 h-4" /></button>
        </form>
      )}

      {step === 'payment' && (
        <div className="px-4 mt-3 space-y-3">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">Payment method</div>
          <PaymentMethod id="cod" label="Cash on Delivery" sub="Pay when your order arrives" selected={method === 'cod'} onClick={() => setMethod('cod')} icon={Banknote} color="bg-neutral-800" />
          <PaymentMethod id="bkash" label="bKash" sub="Pay securely with bKash" selected={method === 'bkash'} onClick={() => setMethod('bkash')} icon={Smartphone} color="bg-pink-600" />
          <PaymentMethod id="nagad" label="Nagad" sub="Instant payment via Nagad" selected={method === 'nagad'} onClick={() => setMethod('nagad')} icon={Wallet} color="bg-orange-500" />

          {(method === 'bkash' || method === 'nagad') && (
            <div className="rounded-2xl bg-neutral-50 p-4 space-y-2">
              <label className="text-[12px] font-medium text-neutral-700">{method === 'bkash' ? 'bKash' : 'Nagad'} mobile number</label>
              <input value={payPhone} onChange={(e) => setPayPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" className="w-full h-11 px-4 rounded-xl bg-white border border-neutral-200 outline-none focus:border-emerald-500 text-sm" />
              <div className="text-[10.5px] text-neutral-500">We’ll send a 4-digit OTP to verify your payment.</div>
            </div>
          )}

          <div className="rounded-2xl bg-emerald-50 p-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-[12.5px]"><span className="text-neutral-600">Subtotal</span><span>৳{formatBDT(subtotal)}</span></div>
            <div className="flex items-center justify-between text-[12.5px]"><span className="text-neutral-600">Delivery</span><span>{delivery === 0 ? 'Free' : `৳${formatBDT(delivery)}`}</span></div>
            <div className="flex items-center justify-between font-bold"><span>Total</span><span className="text-emerald-700">৳{formatBDT(total)}</span></div>
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure checkout • your data is encrypted.</div>

          <div className="lg:hidden fixed bottom-16 inset-x-0 bg-white border-t border-neutral-100 px-4 py-3 z-30">
            <button disabled={loading} onClick={initiatePayment} className="w-full h-12 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">
              {loading ? 'Processing…' : (method === 'cod' ? `Place order · ৳${formatBDT(total)}` : `Pay with ${method === 'bkash' ? 'bKash' : 'Nagad'} · ৳${formatBDT(total)}`)}
            </button>
          </div>
          <div className="hidden lg:block mt-4">
            <button disabled={loading} onClick={initiatePayment} className="w-full h-12 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">
              {loading ? 'Processing…' : (method === 'cod' ? `Place order · ৳${formatBDT(total)}` : `Pay with ${method === 'bkash' ? 'bKash' : 'Nagad'} · ৳${formatBDT(total)}`)}
            </button>
          </div>
        </div>
      )}

      {step === 'otp' && session && (
        <div className="px-6 mt-8 text-center">
          <div className={`w-14 h-14 mx-auto rounded-2xl grid place-items-center ${method === 'bkash' ? 'bg-pink-600' : 'bg-orange-500'}`}>
            {method === 'bkash' ? <Smartphone className="w-7 h-7 text-white" /> : <Wallet className="w-7 h-7 text-white" />}
          </div>
          <h2 className="text-lg font-extrabold mt-4">Verify your payment</h2>
          <p className="text-[12.5px] text-neutral-500 mt-1">Enter the 4-digit OTP sent to <span className="font-semibold text-neutral-800">{session.phone}</span></p>
          <div className="mt-1 text-[11px] text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded">Demo OTP: <span className="font-mono font-bold">{session.demoOtp}</span></div>
          <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="• • • •" inputMode="numeric" className="mt-5 w-40 mx-auto block h-14 text-center tracking-[0.6em] text-2xl font-bold rounded-xl bg-neutral-50 border-2 border-neutral-200 outline-none focus:border-emerald-500" />
          <button disabled={loading} onClick={verifyOtp} className="mt-6 w-full h-12 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">{loading ? 'Verifying…' : `Verify & pay ৳${formatBDT(total)}`}</button>
          <button onClick={() => setStep('payment')} className="mt-2 w-full h-11 rounded-full bg-neutral-100 text-neutral-700 font-medium">Change payment method</button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
