import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, ChevronRight, ShieldCheck, Phone, Mail, ClipboardList, HelpCircle, Leaf } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';

const Row = ({ icon: Icon, label, to, onClick, danger = false }) => {
  const cls = `w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-neutral-100 ${danger ? 'text-red-600' : 'text-neutral-800'} hover:bg-neutral-50 transition-colors`;
  const inner = (
    <>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl grid place-items-center ${danger ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <Icon className={`w-4 h-4 ${danger ? 'text-red-600' : 'text-emerald-700'}`} />
        </div>
        <span className="text-[14px] font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-neutral-400" />
    </>
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
};

const Profile = () => {
  const { user, logout, isAdmin } = useAuth();
  const nav = useNavigate();

  if (!user) return (
    <div className="pb-4">
      <MobileHeader title="Profile" hideSearch />
      <div className="px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 grid place-items-center"><User className="w-7 h-7 text-emerald-700" /></div>
        <h2 className="text-lg font-extrabold mt-4">Welcome to Sobuj</h2>
        <p className="text-sm text-neutral-500 mt-1">Sign in to track orders and unlock member perks.</p>
        <Link to="/login" className="inline-flex mt-5 items-center gap-2 bg-emerald-600 text-white px-5 h-11 rounded-full text-sm font-semibold">Sign in</Link>
        <Link to="/signup" className="inline-flex mt-2 items-center gap-2 bg-white border border-emerald-600 text-emerald-700 px-5 h-11 rounded-full text-sm font-semibold">Create an account</Link>
      </div>
    </div>
  );

  return (
    <div className="pb-4 max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Profile" hideSearch />
      <div className="hidden lg:block mt-6 mb-2">
        <h1 className="text-3xl font-extrabold">Profile</h1>
      </div>
      <div className="px-4 mt-3">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-white p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/15 grid place-items-center text-xl font-extrabold">{user.name.charAt(0).toUpperCase()}</div>
          <div className="flex-1">
            <div className="font-extrabold">{user.name}</div>
            <div className="text-[12px] opacity-90 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</div>
            <div className="text-[12px] opacity-90 flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</div>
          </div>
          {isAdmin && (<span className="bg-white text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>)}
        </div>

        <div className="mt-4 space-y-2">
          <Row icon={ClipboardList} label="My orders" to="/orders" />
          {isAdmin && <Row icon={ShieldCheck} label="Admin dashboard" to="/admin" />}
          <Row icon={Leaf} label="About organic certification" onClick={() => {}} />
          <Row icon={HelpCircle} label="Help & support" onClick={() => {}} />
          <Row icon={LogOut} label="Logout" danger onClick={() => { logout(); nav('/'); }} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
