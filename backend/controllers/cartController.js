import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

const validItem = (itemId, size) =>
  mongoose.Types.ObjectId.isValid(itemId) &&
  typeof size === "string" && /^[\w-]{1,30}$/.test(size);

const confirmProductSize = async (itemId, size) => {
  const product = await productModel.findById(itemId).select("sizes").lean();
  return Boolean(product?.sizes.includes(size));
};

const addToCart = async (req, res) => {
  const { itemId, size } = req.body || {};
  if (!validItem(itemId, size)) return res.status(400).json({ success: false, message: "Invalid cart item" });
  try {
    if (!(await confirmProductSize(itemId, size))) {
      return res.status(400).json({ success: false, message: "Invalid cart item" });
    }
    const path = `cartData.${itemId}.${size}`;
    const result = await userModel.updateOne(
      { _id: req.userId, $or: [{ [path]: { $exists: false } }, { [path]: { $lt: 99 } }] },
      { $inc: { [path]: 1 } }
    );
    if (!result.matchedCount) return res.status(400).json({ success: false, message: "Cart quantity limit reached" });
    res.json({ success: true, message: "Added to Cart" });
  } catch {
    res.status(500).json({ success: false, message: "Unable to update cart" });
  }
};

const updateCart = async (req, res) => {
  const { itemId, size, quantity } = req.body || {};
  if (!validItem(itemId, size) || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
    return res.status(400).json({ success: false, message: "Invalid cart item" });
  }
  try {
    if (!(await confirmProductSize(itemId, size))) {
      return res.status(400).json({ success: false, message: "Invalid cart item" });
    }
    const path = `cartData.${itemId}.${size}`;
    const result = await userModel.updateOne(
      { _id: req.userId },
      quantity === 0 ? { $unset: { [path]: 1 } } : { $set: { [path]: quantity } }
    );
    if (!result.matchedCount) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "Cart Updated" });
  } catch {
    res.status(500).json({ success: false, message: "Unable to update cart" });
  }
};

const getUserCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("cartData").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, cartData: user.cartData || {} });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load cart" });
  }
};

export { addToCart, updateCart, getUserCart };
