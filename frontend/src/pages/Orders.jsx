import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext.js";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    axios
      .post(
        backendUrl + "/api/order/userorders",
        { page },
        { headers: { token } }
      )
      .then((response) => {
        if (cancelled || !response.data.success) return;
        const items = response.data.orders.flatMap((order) =>
          order.items.map((item) => ({
            ...item,
            status: order.status,
            payment: order.payment,
            paymentMethod: order.paymentMethod,
            date: order.date,
          }))
        );
        setOrderData((current) => page === 0 ? items : [...current, ...items]);
        setHasMore(response.data.hasMore);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
    };
  }, [backendUrl, token, page]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.map((item, index) => (
          <div
            key={index}
            className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-start gap-6 text-sm">
              <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700 ">
                  <p>
                    {currency}
                    {item.price}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className="mt-1">
                  Date:{" "}
                  <span className="text-gray-400">
                    {new Date(item.date).toDateString()}
                  </span>
                </p>
                <p className="mt-1">
                  Payment:{" "}
                  <span className="text-gray-400">{item.paymentMethod}</span>
                </p>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && orderData.length === 0 && <p className="py-8 text-gray-500">Loading your orders…</p>}
      {!loading && orderData.length === 0 && <p className="py-8 text-gray-500">No orders yet.</p>}
      {hasMore && <button onClick={() => { setLoading(true); setPage((current) => current + 1); }} disabled={loading} className="my-6 border px-5 py-2">{loading ? "Loading..." : "Load more orders"}</button>}
    </div>
  );
};

export default Orders;
