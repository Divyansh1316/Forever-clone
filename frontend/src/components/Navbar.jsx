import React, { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import BrandLogo from "./BrandLogo";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext.js";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const profileMenuRef = useRef(null);

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    setFavoriteItems,
    theme,
    setTheme,
  } = useContext(ShopContext);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setFavoriteItems([]);
    navigate("/");
  };

  useEffect(() => {
    if (!profileVisible) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileVisible(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setProfileVisible(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileVisible]);

  useEffect(() => {
    if (!visible) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setVisible(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [visible]);

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to="/">
        <BrandLogo className="w-36" />
      </Link>
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>
      <div className="flex items-center gap-6">
        <img
          onClick={() => setShowSearch(true)}
          src={assets.search_icon}
          className="w-5 cursor-pointer dark:brightness-0 dark:invert"
          alt=""
        />
        <div className="group relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileVisible((current) => !current)}
            aria-label="Open profile menu"
            aria-expanded={profileVisible}
            className="flex items-center"
          >
            <img src={assets.profile_icon} className="w-5 cursor-pointer dark:brightness-0 dark:invert" alt="" />
          </button>
          {/* Dropdown Menu */}
          {
            <div className={`${profileVisible ? "block" : "hidden"} absolute dropdown-menu right-0 pt-4 z-50`}>
              <div className="flex flex-col gap-2 w-52 py-4 px-4 bg-slate-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-100 rounded-lg shadow-lg">
                {token ? <>
                  <Link onClick={() => setProfileVisible(false)} to="/profile" className="cursor-pointer hover:text-black dark:hover:text-white">My Profile</Link>
                  <Link onClick={() => setProfileVisible(false)} to="/favorites" className="cursor-pointer hover:text-black dark:hover:text-white">Favorites</Link>
                  <Link onClick={() => setProfileVisible(false)} to="/orders" className="cursor-pointer hover:text-black dark:hover:text-white">Orders</Link>
                  <div className="mt-1 flex items-center justify-between gap-3 border-t border-slate-300 pt-3 dark:border-zinc-600">
                    <label className="text-sm font-medium" htmlFor="theme-choice">Theme</label>
                    <select id="theme-choice" value={theme} onChange={(event) => setTheme(event.target.value)} className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700">
                      <option value="system">Device</option><option value="light">Light</option><option value="dark">Dark</option>
                    </select>
                  </div>
                  <button type="button" onClick={logout} className="text-left cursor-pointer hover:text-black dark:hover:text-white">Logout</button>
                </> : <>
                  <Link onClick={() => setProfileVisible(false)} to="/login">Sign in</Link>
                  <Link onClick={() => setProfileVisible(false)} to="/signup">Sign up</Link>
                  <div className="mt-1 flex items-center justify-between gap-3 border-t border-slate-300 pt-3 dark:border-zinc-600">
                    <label className="text-sm font-medium" htmlFor="theme-choice">Theme</label>
                    <select id="theme-choice" value={theme} onChange={(event) => setTheme(event.target.value)} className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-700">
                      <option value="system">Device</option><option value="light">Light</option><option value="dark">Dark</option>
                    </select>
                  </div>
                </>}
              </div>
            </div>
          }
        </div>
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5 dark:brightness-0 dark:invert" alt="" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px] dark:bg-zinc-100 dark:text-zinc-900">
            {getCartCount()}
          </p>
        </Link>
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="sm:hidden"
          aria-label="Open navigation menu"
          aria-expanded={visible}
          aria-controls="mobile-navigation"
        >
          <img src={assets.menu_icon} className="w-5 dark:brightness-0 dark:invert" alt="" />
        </button>
      </div>

      {/* Sidebar menu for small screens */}

      <div
        id="mobile-navigation"
        aria-hidden={!visible}
        className={`fixed inset-0 z-[100] overflow-y-auto bg-white text-gray-700 shadow-xl transition-transform duration-300 dark:bg-zinc-900 dark:text-zinc-100 sm:hidden ${
          visible ? "visible translate-x-0" : "invisible pointer-events-none translate-x-full"
        }`}
      >
        <nav className="flex min-h-full flex-col">
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 border-b border-gray-200 p-4 text-left dark:border-zinc-700"
          >
            <img src={assets.dropdown_icon} className="h-4 rotate-180 dark:brightness-0 dark:invert" alt="" />
            <span>Back</span>
          </button>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/about"
          >
            ABOUT
          </NavLink>
          {token ? <>
            <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/profile">MY PROFILE</NavLink>
            <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/favorites">FAVORITES</NavLink>
            <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/orders">ORDERS</NavLink>
          </> : <>
            <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/login">SIGN IN</NavLink>
            <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/signup">SIGN UP</NavLink>
          </>}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
