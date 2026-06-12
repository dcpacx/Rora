import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Protected } from './components/Protected';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Categories from './pages/Categories';
import CategoryPage from './pages/Category';
import ProductPage from './pages/Product';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Search from './pages/Search';
import { Login, Signup } from './pages/Auth';
import { AdminLayout, AdminDashboard } from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import { Toaster } from './components/ui/toaster';

const PhoneShell = ({ children }) => {
  const { pathname } = useLocation();
  const hideNav = pathname.startsWith('/admin') || pathname === '/login' || pathname === '/signup' || pathname.startsWith('/product/');
  return (
    <div className="phone-shell-outer">
      <div className="phone-shell">
        <div className="phone-shell-content">{children}</div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { pathname } = useLocation();
  // Admin routes use a full-screen layout, not the phone shell
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    return (
      <Routes>
        <Route path="/admin" element={<Protected adminOnly><AdminLayout /></Protected>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Routes>
    );
  }
  return (
    <PhoneShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </PhoneShell>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
