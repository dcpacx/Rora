import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, ChevronRight, Phone, Mail, ClipboardList, HelpCircle, Leaf, Bell, Pencil, MessageCircle, MapPin, ShieldCheck, Heart } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import { ADMIN_PATH } from '../lib/admin-path';

const ProfileRow = ({ icon: Icon, label, to, onClick, danger = false, testid }) => {
  const cls = `w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-neutral-100 ${danger ? 'text-red-600' : 'text-neutral-800'} hover:bg-neutral-50 hover:border-emerald-200 transition-all duration-200`;
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
  if (to) return <Link to={to} data-testid={testid} className={cls}>{inner}</Link>;
  return <button onClick={onClick} data-testid={testid} className={cls}>{inner}</button>;
};

const Profile = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  if (!user) return (
    <div className="pb-4 max-w-2xl mx-auto lg:px-6">
      <MobileHeader title="Profile" hideSearch />
      <div className="px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 grid place-items-center"><User className="w-7 h-7 text-emerald-700" /></div>
        <h2 className="text-lg font-extrabold mt-4">Welcome to প্রকৃতির ঘ্রাণ</h2>
        <p className="text-sm text-neutral-500 mt-1">Sign in to track orders and edit your profile.</p>
        <Link to="/login" data-testid="profile-signin-link" className="inline-flex mt-5 items-center gap-2 bg-emerald-700 text-white px-5 h-11 rounded-full text-sm font-semibold hover:bg-emerald-800 transition-colors">Sign in</Link>
        <Link to="/signup" data-testid="profile-signup-link" className="inline-flex mt-2 items-center gap-2 bg-white border border-emerald-700 text-emerald-700 px-5 h-11 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors">Create an account</Link>
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
        <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-500 text-white p-4 flex items-center gap-3 relative overflow-hidden">
          <div className="w-14 h-14 rounded-full bg-white/15 grid place-items-center text-xl font-extrabold overflow-hidden shrink-0">
            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-lg truncate">{user.name}</div>
            <div className="text-[12px] opacity-90 flex items-center gap-1 truncate"><Mail className="w-3 h-3 shrink-0" /> {user.email}</div>
            <div className="text-[12px] opacity-90 flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" /> {user.phone}</div>
          </div>
          <Link to="/profile/edit" data-testid="profile-edit-btn" className="shrink-0 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 h-8 rounded-full transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          <ProfileRow icon={MapPin} label="Address book" to="/profile/addresses" testid="profile-row-addresses" />
          <ProfileRow icon={Heart} label="Wishlist" to="/wishlist" testid="profile-row-wishlist" />
          <ProfileRow icon={ClipboardList} label="My orders" to="/orders" testid="profile-row-orders" />
          <ProfileRow icon={Bell} label="Notifications" to="/notifications" testid="profile-row-notifications" />
          <ProfileRow icon={MessageCircle} label="Messages" to="/messages" testid="profile-row-messages" />
          {user.role === 'admin' && (
            <ProfileRow icon={ShieldCheck} label="Admin dashboard" to={ADMIN_PATH} testid="profile-row-admin" />
          )}
          <ProfileRow icon={Leaf} label="About organic certification" onClick={() => {}} testid="profile-row-about" />
          <ProfileRow icon={HelpCircle} label="Help & support" to="/messages" testid="profile-row-help" />
          <ProfileRow icon={LogOut} label="Logout" danger onClick={() => { logout(); nav('/'); }} testid="profile-row-logout" />
        </div>

        <div className="text-center mt-8 text-[10.5px] text-neutral-400">
          প্রকৃতির ঘ্রাণ · © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
