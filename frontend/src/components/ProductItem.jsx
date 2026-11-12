import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext.js";

const ProductItem = ({ id, image, name, price }) => {
  const { currency, favoriteItems, toggleFavorite } = useContext(ShopContext);
  const isFavorite = favoriteItems.includes(id);

  return (
    <div className="product-card relative cursor-pointer text-gray-700 transition-transform duration-300 hover:-translate-y-1 dark:text-gray-100">
      <Link to={`/product/${id}`}>
        <div className="overflow-hidden">
          <img
            className="transition-transform duration-500 ease-out hover:scale-110"
            src={image[0]}
            alt={name}
            loading="lazy"
            decoding="async"
          />
        </div>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="text-sm font-medium">{currency}{price}</p>
      </Link>
      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={isFavorite}
        onClick={toggleFavorite.bind(null, id)}
        className={`favorite-control absolute right-2 top-2 p-0 text-2xl leading-none transition-transform duration-200 hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 ${isFavorite ? "favorite-pop text-rose-500" : "text-gray-700 dark:text-[#18181b]"}`}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? "\u2665" : "\u2661"}
      </button>
    </div>
  );
};

export default ProductItem;
