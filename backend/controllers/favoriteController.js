import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

const getFavorites = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("favorites").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, favorites: (user.favorites || []).map(String) });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load favorites" });
  }
};

const updateFavorite = async (req, res) => {
  const { productId, favorite } = req.body || {};
  if (!mongoose.Types.ObjectId.isValid(productId) || typeof favorite !== "boolean") {
    return res.status(400).json({ success: false, message: "Invalid favorite" });
  }
  try {
    if (favorite && !(await productModel.exists({ _id: productId }))) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const update = favorite
      ? { $addToSet: { favorites: productId } }
      : { $pull: { favorites: productId } };
    const result = await userModel.updateOne({ _id: req.userId }, update);
    if (!result.matchedCount) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, favorite });
  } catch {
    res.status(500).json({ success: false, message: "Unable to update favorite" });
  }
};

export { getFavorites, updateFavorite };
