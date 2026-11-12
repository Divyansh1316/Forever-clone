import React, { useContext, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext.js";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, productsLoading, search } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevance");

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
      // Prev is previous array, filter method returns a new prev array and keeps only those items that are not equal to e.target.value
    } else {
      setCategory((prev) => [...prev, e.target.value]);
      //adding new item, [...] (spread operator) creates a new array that all items in prev and the new item (e.target.value)
    }

    setSortType("relevance"); //self logic for filter and sort to work together
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }

    setSortType("relevance"); //self logic for filter and sort to work together
  };

  const filterProducts = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase();
    let filtered = products.filter((item) => {
      const searchableText = [item.name, item.description, item.category, item.subCategory]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      const matchesCategory = category.length === 0 || category.includes(item.category);
      const matchesSubCategory = subCategory.length === 0 || subCategory.includes(item.subCategory);
      return matchesSearch && matchesCategory && matchesSubCategory;
    });

    if (sortType === "low-high") filtered = filtered.slice().sort((a, b) => a.price - b.price);
    if (sortType === "high-low") filtered = filtered.slice().sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, search, category, subCategory, sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Filter options */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>
        {/* Category Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Men"}
                onChange={toggleCategory}
              />{" "}
              Men
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Women"}
                onChange={toggleCategory}
              />{" "}
              Women
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Kids"}
                onChange={toggleCategory}
              />{" "}
              Kids
            </p>
          </div>
        </div>

        {/* SubCategory Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Topwear"}
                onChange={toggleSubCategory}
              />
              Topwear
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Bottomwear"}
                onChange={toggleSubCategory}
              />
              Bottomwear
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Winterwear"}
                onChange={toggleSubCategory}
              />
              Winterwear
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          {/* Products Sort */}
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-2"
          >
            <option value="relevance">Sort by: Relevance</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Map Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {productsLoading && Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[3/4] animate-pulse bg-gray-100 dark:bg-zinc-700" />)}
          {!productsLoading && filterProducts.length === 0 && <p className="col-span-full py-10 text-center text-gray-500">{search.trim() ? `No products found for “${search.trim()}”.` : "No products match these filters."}</p>}
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              name={item.name}
              id={item._id}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
