import React, { useCallback, useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext.js";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const paypalOrderIdFromUrl = searchParams.get("paypalOrderId");
  const storedPaypalOrderId = localStorage.getItem("paypalOrderId");

  const paypalOrderId = storedPaypalOrderId || paypalOrderIdFromUrl;

  const verifyPayment = useCallback(async () => {
    try {
      if (!token) {
        return null;
      }

      if (!paypalOrderId) {
        toast.error("Payment details are missing. Please contact support.");
        navigate("/cart");
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/verifyPaypal",
        { success, orderId, paypal_order_id: paypalOrderId || undefined }, // Allow undefined
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems({});
        navigate("/orders");
        localStorage.removeItem("paypalOrderId"); // Clean up
      } else {
        toast.error(response.data.message || "Payment verification failed");
        navigate("/cart");
      }
    } catch (error) {
      toast.error(
        error.message || "An error occurred during payment verification"
      );
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, navigate, orderId, paypalOrderId, setCartItems, success, token]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Processing payment...
      </div>
    );
  }

  return <div></div>;
};

export default Verify;
