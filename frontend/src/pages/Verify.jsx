import React, { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const paypalOrderId = searchParams.get("PayerID");

  const verifyPayment = async () => {
    try {
      if (!token) {
        return null;
      }

      // // Verify Stripe payment
      // const response = await axios.post(
      //   backendUrl + "/api/order/verifyStripe",
      //   { success, orderId },
      //   { headers: { token } }
      // );

      // Verify PayPal payment
      const response = await axios.post(
        backendUrl + "/api/order/verifyPaypal",
        { success, orderId, paypal_order_id: paypalOrderId },
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems({});
        navigate("/orders");
      } else {
        navigate("/cart");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [token]);

  return <div></div>;
};

export default Verify;
