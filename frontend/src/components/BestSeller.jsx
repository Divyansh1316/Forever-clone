import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext.js";
import Title from "./Title";
import ProductItem from "./ProductItem";

const BestSeller = () => {
  const { products, productsLoading } = useContext(ShopContext);
  const bestSeller = useMemo(
    () => products.filter((item) => item.bestseller).slice(0, 5),
    [products]
  );

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"BEST"} text2={"SELLERS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Explore customer favorites chosen for their style, quality, and everyday comfort.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {productsLoading && Array.from({ length: 5 }, (_, index) => <div key={index} className="aspect-[3/4] animate-pulse bg-gray-100 dark:bg-zinc-700" />)}
        {bestSeller.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            image={item.image}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
