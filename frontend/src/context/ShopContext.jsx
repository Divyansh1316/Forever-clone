import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { ShopContext } from "./ShopContext.js";

const readGuestCart = () => {
  try {
    const savedCart = JSON.parse(localStorage.getItem("guestCart") || "{}");
    return savedCart && typeof savedCart === "object" && !Array.isArray(savedCart) ? savedCart : {};
  } catch {
    return {};
  }
};

const saveGuestCart = (cart) => {
  try {
    localStorage.setItem("guestCart", JSON.stringify(cart));
  } catch {
    // Keep the in-memory cart usable when browser storage is unavailable.
  }
};

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState(readGuestCart);
  const [products, setProducts] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("store-products") || "[]"); } catch { return []; }
  });
  const [productsLoading, setProductsLoading] = useState(() => {
    try { return !JSON.parse(sessionStorage.getItem("store-products") || "[]").length; } catch { return true; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);
    if (!token) saveGuestCart(cartData);
    toast.success("Added to cart");

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch {
          // Ignore malformed local cart entries; the API validates persisted items.
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);
    if (!token) saveGuestCart(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch {
          // Ignore cart entries whose product is no longer available.
        }
      }
    }
    return totalAmount;
  };

  useEffect(() => {
    axios
      .get(backendUrl + "/api/product/list")
      .then((response) => {
        if (response.data.success) {
          setProducts(response.data.products);
          try { sessionStorage.setItem("store-products", JSON.stringify(response.data.products)); } catch { /* Storage can be unavailable or full. */ }
        }
        else toast.error(response.data.message);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setProductsLoading(false));
  }, [backendUrl]);

  useEffect(() => {
    const applyTheme = () => {
      const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
      localStorage.setItem("theme", theme);
    };
    applyTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    if (!token) return;
    axios.get(backendUrl + "/api/favorites", { headers: { token } })
      .then((response) => { if (response.data.success) setFavoriteItems(response.data.favorites); })
      .catch((error) => {
        if (error.response?.status === 404) {
          toast.info("Sign-in succeeded. Favorites will work after the latest backend is deployed.");
          return;
        }
        toast.error(error.response?.data?.message || "Unable to load favorites");
      });
  }, [backendUrl, token]);

  const toggleFavorite = async (productId) => {
    if (!token) { toast.info("Sign in to save favorites"); navigate("/login"); return; }
    const isFavorite = favoriteItems.includes(productId);
    setFavoriteItems((current) => isFavorite ? current.filter((id) => id !== productId) : [...current, productId]);
    try {
      await axios.post(backendUrl + "/api/favorites", { productId, favorite: !isFavorite }, { headers: { token } });
    } catch (error) {
      setFavoriteItems((current) => isFavorite ? [...current, productId] : current.filter((id) => id !== productId));
      toast.error(error.response?.status === 404
        ? "Favorites require the latest backend deployment."
        : error.response?.data?.message || "Unable to update favorites");
    }
  };

  useEffect(() => {
    if (!token) return;
    axios
      .post(backendUrl + "/api/cart/get", {}, { headers: { token } })
      .then(async (response) => {
        if (!response.data.success) return;

        const mergedCart = structuredClone(response.data.cartData || {});
        const guestCart = readGuestCart();
        const pendingSync = [];
        const unsyncedCart = {};

        for (const [itemId, sizes] of Object.entries(guestCart)) {
          if (!sizes || typeof sizes !== "object" || Array.isArray(sizes)) continue;
          for (const [size, guestQuantity] of Object.entries(sizes)) {
            if (!Number.isInteger(guestQuantity) || guestQuantity < 1) continue;
            const currentQuantity = Number(mergedCart[itemId]?.[size]) || 0;
            const quantity = Math.min(99, currentQuantity + guestQuantity);
            mergedCart[itemId] = { ...(mergedCart[itemId] || {}), [size]: quantity };
            pendingSync.push({ itemId, size, quantity, guestQuantity });
          }
        }

        const syncResults = await Promise.allSettled(pendingSync.map(({ itemId, size, quantity }) =>
          axios.post(backendUrl + "/api/cart/update", { itemId, size, quantity }, { headers: { token } })
        ));
        syncResults.forEach((result, index) => {
          if (result.status === "rejected") {
            const { itemId, size, guestQuantity } = pendingSync[index];
            unsyncedCart[itemId] = { ...(unsyncedCart[itemId] || {}), [size]: guestQuantity };
          }
        });

        setCartItems(mergedCart);
        if (Object.keys(unsyncedCart).length) {
          saveGuestCart(unsyncedCart);
          toast.info("Your cart is available, but some items could not sync to your account yet.");
        } else {
          try { localStorage.removeItem("guestCart"); } catch { /* Storage may be unavailable. */ }
        }
      })
      .catch((error) => toast.error(error.message));
  }, [backendUrl, token]);

  const value = {
    products,
    productsLoading,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    favoriteItems,
    toggleFavorite,
    setFavoriteItems,
    theme,
    setTheme,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
