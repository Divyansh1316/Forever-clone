import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext.js";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);
  const navigate = useNavigate();

  return showSearch ? (
    <div className="border-t border-b bg-gray-50 text-center">
      <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
        <form className="flex flex-1" onSubmit={(event) => { event.preventDefault(); setSearch(search.trim()); navigate("/collection"); setShowSearch(false); }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none bg-inherit text-sm"
          type="search"
          aria-label="Search products"
          placeholder="Search products by name, type, or description"
        />
        <button type="submit" aria-label="Search products"><img className="w-4 dark:brightness-0 dark:invert" src={assets.search_icon} alt="" /></button>
        </form>
      </div>
      <img
        onClick={() => setShowSearch(false)}
        className="inline w-3 cursor-pointer"
        src={assets.cross_icon}
        alt=""
      />
    </div>
  ) : null;
};

export default SearchBar;
