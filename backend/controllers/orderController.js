import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import {
  Client as PayPalClient,
  Environment as PayPalEnvironment,
  OrdersController,
  PaypalExperienceUserAction,
} from "@paypal/paypal-server-sdk";
import { allowedOrigins } from "../config/security.js";

const currency = "USD";
const deliveryCharge = 10;
const paypalClient = new PayPalClient({
  environment:
    process.env.PAYPAL_MODE === "live"
      ? PayPalEnvironment.Production
      : PayPalEnvironment.Sandbox,
  timeout: 15_000,
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID || "",
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  },
});
const paypalOrders = new OrdersController(paypalClient);

const buildOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new Error("Invalid order items");
  }

  const validItems = items.map((item) => {
    if (
      !mongoose.Types.ObjectId.isValid(item?._id) ||
      !Number.isInteger(item?.quantity) || item.quantity < 1 || item.quantity > 99 ||
      typeof item?.size !== "string" || item.size.length > 30
    ) throw new Error("Invalid order items");
    return item;
  });

  const ids = [...new Set(validItems.map((item) => item._id.toString()))];
  const products = await productModel.find({ _id: { $in: ids } }).lean();
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const orderItems = validItems.map((item) => {
    const product = productsById.get(item._id.toString());
    if (!product || !product.sizes.includes(item.size)) throw new Error("Invalid order items");
    return { ...product, size: item.size, quantity: item.quantity };
  });

  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0
  );
  if (!Number.isSafeInteger(subtotalCents) || subtotalCents <= 0) {
    throw new Error("Invalid order total");
  }
  return { orderItems, amount: (subtotalCents + deliveryCharge * 100) / 100, subtotalCents };
};

const normalizeAddress = (address) => {
  const fields = ["firstName", "lastName", "email", "street", "city", "state", "zipcode", "country", "phone"];
  const valid = address && typeof address === "object" && !Array.isArray(address) && fields.every(
    (field) => typeof address[field] === "string" && address[field].trim().length > 0 && address[field].length <= 200
  );
  return valid
    ? Object.fromEntries(fields.map((field) => [field, address[field].trim()]))
    : null;
};

const placeOrder = async (req, res) => {
  try {
    const { items, address } = req.body || {};
    const safeAddress = normalizeAddress(address);
    if (!safeAddress) {
      return res.status(400).json({ success: false, message: "Invalid delivery address" });
    }
    const { orderItems, amount } = await buildOrderItems(items);
    const order = await orderModel.create({
      userId: req.userId,
      items: orderItems,
      address: safeAddress,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    });
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
    res.json({ success: true, message: "Order Placed", orderId: order._id });
  } catch (error) {
    const clientError = error.message.startsWith("Invalid order") || error.message.startsWith("Invalid product");
    res.status(clientError ? 400 : 500).json({
      success: false,
      message: clientError ? error.message : "Unable to place order",
    });
  }
};

const placeOrderPaypal = async (req, res) => {
  let order;
  try {
    const { items, address } = req.body || {};
    const origin = req.get("origin");
    const safeAddress = normalizeAddress(address);
    if (!safeAddress) {
      return res.status(400).json({ success: false, message: "Invalid delivery address" });
    }
    if (!origin || !allowedOrigins.has(origin)) {
      return res.status(400).json({ success: false, message: "Unapproved checkout origin" });
    }
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return res.status(503).json({ success: false, message: "PayPal is not configured" });
    }
    const { orderItems, amount, subtotalCents } = await buildOrderItems(items);
    order = await orderModel.create({
      userId: req.userId,
      items: orderItems,
      address: safeAddress,
      amount,
      paymentMethod: "PayPal",
      payment: false,
      date: Date.now(),
    });

    const response = await paypalOrders.createOrder({
      body: {
        intent: "CAPTURE",
        purchaseUnits: [{
          referenceId: order._id.toString(),
          amount: {
            currencyCode: currency,
            value: amount.toFixed(2),
            breakdown: {
              itemTotal: { currencyCode: currency, value: (subtotalCents / 100).toFixed(2) },
              shipping: { currencyCode: currency, value: deliveryCharge.toFixed(2) },
            },
          },
          items: orderItems.map((item) => ({
            name: item.name.slice(0, 127),
            unitAmount: { currencyCode: currency, value: item.price.toFixed(2) },
            quantity: item.quantity.toString(),
          })),
        }],
        paymentSource: {
          paypal: {
            experienceContext: {
              returnUrl: `${origin}/verify?success=true&orderId=${order._id}`,
              cancelUrl: `${origin}/verify?success=false&orderId=${order._id}`,
              userAction: PaypalExperienceUserAction.PayNow,
            },
          },
        },
      },
      prefer: "return=representation",
      paypalRequestId: order._id.toString(),
    });
    const paypalOrder = response.result;
    const approvalUrl = paypalOrder.links?.find(
      (link) => link.rel === "approve" || link.rel === "payer-action"
    )?.href;
    if (!approvalUrl || !paypalOrder.id) throw new Error("PayPal did not return an approval link");
    order.paypalOrderId = paypalOrder.id;
    await order.save();
    res.json({ success: true, session_url: approvalUrl, paypalOrderId: paypalOrder.id });
  } catch (error) {
    if (order) await orderModel.findByIdAndDelete(order._id).catch(() => {});
    const clientError = error.message.startsWith("Invalid order") || error.message.startsWith("Invalid product");
    res.status(clientError ? 400 : 502).json({
      success: false,
      message: clientError ? error.message : "Unable to start PayPal checkout",
    });
  }
};

const verifyPaypal = async (req, res) => {
  const { orderId, success } = req.body || {};
  const paypalOrderId = req.body?.paypal_order_id;
  if (success !== "true") return res.json({ success: false });
  if (!mongoose.Types.ObjectId.isValid(orderId) || typeof paypalOrderId !== "string") {
    return res.status(400).json({ success: false, message: "Invalid payment details" });
  }

  try {
    const order = await orderModel.findOne({ _id: orderId, userId: req.userId }).select("+paypalOrderId");
    if (!order || order.paymentMethod !== "PayPal" || order.paypalOrderId !== paypalOrderId) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.payment) return res.json({ success: true });

    const response = await paypalOrders.captureOrder({
      id: paypalOrderId,
      paypalRequestId: `${order._id}-capture`,
      prefer: "return=representation",
    });
    const paypalOrder = response.result;
    const capture = paypalOrder.purchaseUnits?.[0]?.payments?.captures?.[0];
    if (
      paypalOrder.status !== "COMPLETED" ||
      paypalOrder.id !== order.paypalOrderId ||
      capture?.status !== "COMPLETED" ||
      capture?.amount?.currencyCode !== currency ||
      capture?.amount?.value !== order.amount.toFixed(2)
    ) {
      return res.status(400).json({ success: false, message: "Payment could not be verified" });
    }

    const updatedOrder = await orderModel.findOneAndUpdate(
      { _id: order._id, userId: req.userId, payment: false },
      { payment: true },
      { new: true }
    );
    if (!updatedOrder) return res.status(409).json({ success: false, message: "Order was already processed" });
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
    res.json({ success: true });
  } catch {
    const alreadyPaid = await orderModel
      .findOne({ _id: orderId, userId: req.userId, payment: true })
      .select("+paypalOrderId")
      .lean()
      .catch(() => null);
    if (alreadyPaid?.paypalOrderId === paypalOrderId) return res.json({ success: true });
    res.status(502).json({ success: false, message: "Unable to verify PayPal payment" });
  }
};

const allOrders = async (_req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 }).lean();
    res.json({ success: true, orders });
  } catch {
    res.status(500).json({ success: false, message: "Unable to list orders" });
  }
};

const userOrders = async (req, res) => {
  try {
    const page = Number.isInteger(req.body?.page) ? Math.max(0, Math.min(req.body.page, 1000)) : 0;
    const rows = await orderModel.find({ userId: req.userId })
      .sort({ date: -1, _id: -1 })
      .skip(page * 21)
      .limit(21)
      .lean();
    res.json({ success: true, orders: rows.slice(0, 20), hasMore: rows.length > 20 });
  } catch {
    res.status(500).json({ success: false, message: "Unable to list orders" });
  }
};

const updateStatus = async (req, res) => {
  const { orderId, status } = req.body || {};
  const validStatuses = ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"];
  if (!mongoose.Types.ObjectId.isValid(orderId) || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid order status" });
  }
  try {
    const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Status Updated" });
  } catch {
    res.status(500).json({ success: false, message: "Unable to update order" });
  }
};

export { verifyPaypal, placeOrder, placeOrderPaypal, allOrders, userOrders, updateStatus };
