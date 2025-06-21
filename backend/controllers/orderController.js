import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
// import Stripe from "stripe";
// import Razorpay from "razorpay";
import paypal from "@paypal/checkout-server-sdk";

// Global variables
const currency = "USD"; // PayPal uses USD for sandbox; adjust as needed
const deliveryCharge = 10;

// // Gateway initialize - Stripe
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PayPal client setup

const paypalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

// // Razorpay initialization
// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear cart data
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using PayPal Method
const placeOrderPaypal = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    console.log("PayPal Request Body:", JSON.stringify(req.body, null, 2));

    // Calculate item_total from items array
    const itemTotal = items
      .reduce((total, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 0;
        const itemSubtotal = itemPrice * itemQuantity;
        console.log(
          `Item: ${item.name}, Price: ${itemPrice}, Quantity: ${itemQuantity}, Subtotal: ${itemSubtotal}`
        );
        return total + itemSubtotal;
      }, 0)
      .toFixed(2);

    // console.log("Calculated Item Total:", itemTotal);
    // console.log("Delivery Charge:", deliveryCharge);
    // console.log(
    //   "Total with Delivery:",
    //   (parseFloat(itemTotal) + deliveryCharge).toFixed(2)
    // );
    // console.log("Frontend Amount:", amount);

    // Validate frontend amount against item_total + deliveryCharge
    const frontendAmount = parseFloat(amount).toFixed(2);
    const expectedTotal = (parseFloat(itemTotal) + deliveryCharge).toFixed(2);
    if (
      Math.abs(parseFloat(frontendAmount) - parseFloat(expectedTotal)) > 0.01
    ) {
      console.warn(
        "Amount mismatch: Frontend amount does not match calculated total with delivery"
      );
      return res.json({
        success: false,
        message: `Amount mismatch: Frontend amount (${frontendAmount}) does not match calculated total with delivery (${expectedTotal})`,
      });
    }

    const orderData = {
      userId,
      items,
      address,
      amount: parseFloat(expectedTotal),
      paymentMethod: "PayPal",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: expectedTotal,
            breakdown: {
              item_total: { currency_code: currency, value: itemTotal },
              shipping: {
                currency_code: currency,
                value: deliveryCharge.toFixed(2),
              },
            },
          },
          items: items.map((item) => ({
            name: item.name || "Unknown Item",
            unit_amount: {
              currency_code: currency,
              value: parseFloat(item.price).toFixed(2),
            },
            quantity: item.quantity.toString(),
          })),
        },
      ],
      application_context: {
        return_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      },
    });

    console.log("PayPal API Request:", JSON.stringify(request.body, null, 2));

    const response = await paypalClient.execute(request);
    const approvalUrl = response.result.links.find(
      (link) => link.rel === "approve"
    ).href;

    res.json({ success: true, session_url: approvalUrl });
  } catch (error) {
    console.error(
      "PayPal Error:",
      error.response ? error.response.data : error
    );
    res.json({ success: false, message: error.message });
  }
};

// Verify PayPal payment
const verifyPaypal = async (req, res) => {
  const { orderId, success, userId, paypal_order_id } = req.body;

  try {
    console.log("Verify PayPal Request:", {
      orderId,
      success,
      userId,
      paypal_order_id,
    });

    if (success === "true") {
      const request = new paypal.orders.OrdersCaptureRequest(paypal_order_id);
      const response = await paypalClient.execute(request);

      console.log(
        "PayPal Capture Response:",
        JSON.stringify(response.result, null, 2)
      );

      if (response.result.status === "COMPLETED") {
        await orderModel.findByIdAndUpdate(orderId, { payment: true });
        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        res.json({ success: true });
      } else {
        await orderModel.findByIdAndDelete(orderId);
        res.json({ success: false, message: "Payment not completed" });
      }
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.error(
      "PayPal Verify Error:",
      error.response ? error.response.data : error
    );
    res.json({ success: false, message: error.message });
  }
};

// // Placing orders using Stripe Method
// const placeOrderStripe = async (req, res) => { ... };
// // Verify Stripe
// const verifyStripe = async (req, res) => { ... };
// // Placing orders using Razorpay Method
// const placeOrderRazorpay = async (req, res) => { ... };
// // Verify Razorpay
// const verifyRazorpay = async (req, res) => { ... };

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data for Frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  // verifyRazorpay,
  // verifyStripe,
  verifyPaypal,
  placeOrder,
  // placeOrderStripe,
  placeOrderPaypal,
  // placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
};
