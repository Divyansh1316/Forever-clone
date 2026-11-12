import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext.js";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = parseInt(cartItems[items][item]);
              itemInfo.price = parseFloat(itemInfo.price);
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const calculatedAmount = orderItems.reduce((total, item) => {
        const subtotal = item.price * item.quantity;
        // console.log(
        //   `Frontend Item: ${item.name}, Price: ${item.price}, Quantity: ${item.quantity}, Subtotal: ${subtotal}`
        // );
        return total + subtotal;
      }, 0);

      // console.log("Frontend Calculated Amount:", calculatedAmount);
      // console.log("getCartAmount():", getCartAmount());
      // console.log("Delivery Fee:", delivery_fee);

      let orderData = {
        address: formData,
        items: orderItems,
        amount: calculatedAmount + delivery_fee,
      };

      // console.log("Frontend Order Data:", JSON.stringify(orderData, null, 2));

      switch (method) {
        case "cod":
          {
          const response = await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );

          if (response.data.success) {
            setCartItems({});
            navigate("/orders");
          } else {
            toast.error(response.data.message);
          }
          break;
          }

        case "paypal":
          {
          const responsePaypal = await axios.post(
            backendUrl + "/api/order/paypal",
            orderData,
            { headers: { token } }
          );
          if (responsePaypal.data.success) {
            const { session_url, paypalOrderId: receivedPaypalOrderId } =
              responsePaypal.data;
            localStorage.setItem("paypalOrderId", receivedPaypalOrderId); // Store before redirect
            window.location.replace(session_url); // Trigger PayPal flow
          } else {
            toast.error(
              responsePaypal.data.message || "PayPal payment initiation failed"
            );
          }
          break;
          }

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* ------------ Left Side ------------ */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="w-full rounded border border-gray-300 bg-white px-3.5 py-1.5 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
            type="text"
            placeholder="First name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="w-full rounded border border-gray-300 bg-white px-3.5 py-1.5 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="w-full rounded border border-gray-300 bg-white px-3.5 py-1.5 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          type="email"
          placeholder="Email address"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="w-full rounded border border-gray-300 bg-white px-3.5 py-1.5 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          type="text"
          placeholder="Street"
        />
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="w-full rounded border border-gray-300 bg-white px-3.5 py-1.5 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
            type="text"
            placeholder="City"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="w-full rounded border border-gray-300 bg-white px-3.5 py-1.5 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="w-full rounded border border-gray-300 bg-white px-3.5 py-1.5 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
            type="number"
            placeholder="Zipcode"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="w-full rounded border border-gray-300 bg-white px-3.5 py-1.5 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="w-full rounded border border-gray-300 bg-white px-3.5 py-1.5 focus:border-rose-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
          type="number"
          placeholder="Phone"
        />
      </div>

      {/* ------------ Right Side ------------ */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/* ------------ Payment Method Selection ------------ */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("paypal")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "paypal" ? "bg-green-400" : ""
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.paypal_logo} alt="PayPal" />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black px-16 py-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
