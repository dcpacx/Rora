import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShopProvider } from './contexts/ShopContext';
import TopBar from './components/TopBar';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/Category';
import ProductPage from './pages/Product';
import CartPage from './pages/Cart';
import WishlistPage from './pages/Wishlist';
import SearchPage from './pages/Search';
import { Toaster } from './components/ui/toaster';

function Layout({ children }) {
  return (
    <div className="App">
      <TopBar />
      <Header />
      <CategoryNav />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ShopProvider>
  );
}

export default App;
