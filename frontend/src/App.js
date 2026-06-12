import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotifProvider } from './contexts/NotifContext';
import { Protected } from './components/Protected';
import BottomNav from './components/BottomNav';
import DesktopNav from './components/DesktopNav';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Categories from './pages/Categories';
import CategoryPage from './pages/Category';
import ProductPage from './pages/Product';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import { Login, Signup } from './pages/Auth';
import { AdminLayout, AdminDashboard } from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminCategoriesPage from './pages/admin/Categories';
import AdminAnalytics from './pages/admin/Analytics';
import AdminMessages from './pages/admin/Messages';
import { Toaster } from './components/ui/toaster';
import { ADMIN_PATH } from './lib/admin-path';

const Shell = ({ children }) => {
  const { pathname } = useLocation();
  const hideNav = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/product/');
  const hideDesktopNav = pathname === '/login' || pathname === '/signup';
  return (
    <div className="app-shell">
      {!hideDesktopNav && <DesktopNav />}
      <div className="app-content">{children}</div>
      {!hideNav && <BottomNav />}
      <ChatWidget />
    </div>
  );
};

const AppRoutes = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith(ADMIN_PATH)) {
    return (
      <Routes>
        <Route path={ADMIN_PATH} element={<Protected adminOnly><AdminLayout /></Protected>}>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Routes>
    );
  }
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<Protected><EditProfile /></Protected>} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Shell>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotifProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster />
          </BrowserRouter>
        </NotifProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
