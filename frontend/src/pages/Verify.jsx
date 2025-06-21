import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const paypalOrderIdFromUrl = searchParams.get("paypalOrderId");
  const storedPaypalOrderId = localStorage.getItem("paypalOrderId");

  // Prioritize stored value, fall back to URL parameter
  const paypalOrderId = storedPaypalOrderId || paypalOrderIdFromUrl;

  const verifyPayment = async () => {
    try {
      console.log("Verification attempt:", retryCount, {
        token,
        success,
        orderId,
        paypalOrderId,
        storedPaypalOrderId,
      });
      if (!token) {
        return null;
      }

      if (!paypalOrderId && retryCount < maxRetries) {
        console.warn("paypalOrderId missing, retrying...", retryCount);
        setTimeout(verifyPayment, 500 * (retryCount + 1)); // Exponential backoff
        setRetryCount(retryCount + 1);
        return;
      }

      if (!paypalOrderId) {
        console.warn(
          "paypalOrderId still missing after retries, relying on backend"
        );
      }

      setLoading(true);

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
      console.log("Verification error:", error);
      toast.error(
        error.message || "An error occurred during payment verification"
      );
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [token, success, orderId, backendUrl, navigate, setCartItems]);

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
