import React, { useContext, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import { ToastContainer } from "react-toastify";
import Verify from "./pages/Verify";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import { ShopContext } from "./context/ShopContext.js";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};

const NotFound = () => (
  <main className="min-h-[50vh] py-16 text-center">
    <h1 className="text-2xl font-medium">Page not found</h1>
    <p className="mt-3 text-gray-600">This page may have moved or the link may be incorrect.</p>
    <a className="inline-block mt-6 underline" href="/">Return to the home page</a>
  </main>
);

const App = () => {
  const { theme } = useContext(ShopContext);
  const { pathname } = useLocation();
  const toastTheme = theme === "system" ? "auto" : theme;
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <ToastContainer theme={toastTheme} />
      <ScrollToTop />
      <Navbar />
      <SearchBar />
      <div key={pathname} className="page-enter">
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/collection" element={<Collection />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/product/:productId" element={<Product />}></Route>
        <Route path="/cart" element={<Cart />}></Route>
        <Route path="/login" element={<Login key="login" initialState="Login" />}></Route>
        <Route path="/signup" element={<Login key="signup" initialState="Sign Up" />}></Route>
        <Route path="/place-order" element={<PlaceOrder />}></Route>
        <Route path="/orders" element={<Orders />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/favorites" element={<Favorites />}></Route>
        <Route path="/verify" element={<Verify />}></Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
