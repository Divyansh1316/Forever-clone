import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext.js";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Favorites = () => {
  const { products, favoriteItems, token, navigate } = useContext(ShopContext);
  const favorites = useMemo(() => products.filter((product) => favoriteItems.includes(product._id)), [products, favoriteItems]);
  React.useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);
  return <section className="border-t pt-10 min-h-64"><Title text1="YOUR" text2="FAVORITES" />
    {token && (favorites.length ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-6 mt-8">{favorites.map((item) => <ProductItem key={item._id} id={item._id} name={item.name} image={item.image} price={item.price} />)}</div> : <p className="py-10 text-gray-500">You have not saved any products yet.</p>)}
  </section>;
};
export default Favorites;
