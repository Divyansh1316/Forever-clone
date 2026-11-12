import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext.js";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products, productsLoading } = useContext(ShopContext);
  const latestProducts = products.slice(0, 10);

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"LATEST"} text2={"COLLECTIONS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Discover the newest pieces selected for this season.
        </p>
      </div>

      {/* Rendering products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {productsLoading && Array.from({ length: 5 }, (_, index) => <div key={index} className="aspect-[3/4] animate-pulse bg-gray-100 dark:bg-zinc-700" />)}
        {latestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
