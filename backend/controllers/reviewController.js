import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

const listReviews = async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product id" });
  }
  try {
    const [result = { reviews: [], summary: [] }] = await reviewModel.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $facet: {
          reviews: [
            { $sort: { createdAt: -1 } },
            { $limit: 30 },
            { $project: { userId: 0 } },
          ],
          summary: [{ $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$rating" } } }],
        },
      },
    ]);
    const summary = result.summary[0] || { count: 0, average: 0 };
    res.json({
      success: true,
      reviews: result.reviews,
      reviewCount: summary.count,
      averageRating: summary.average,
    });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load reviews" });
  }
};

const saveReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body || {};
  if (
    !mongoose.Types.ObjectId.isValid(productId) ||
    !Number.isInteger(rating) || rating < 1 || rating > 5 ||
    typeof comment !== "string" || comment.trim().length < 1 || comment.trim().length > 1000
  ) {
    return res.status(400).json({ success: false, message: "Enter a rating and a review of up to 1,000 characters" });
  }

  try {
    const [product, user] = await Promise.all([
      productModel.exists({ _id: productId }),
      userModel.findById(req.userId).select("name").lean(),
    ]);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const review = await reviewModel.findOneAndUpdate(
      { productId, userId: req.userId },
      { $set: { userName: user.name, rating, comment: comment.trim() } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select("-userId").lean();
    res.json({ success: true, review });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "A review already exists for this product" });
    }
    res.status(500).json({ success: false, message: "Unable to save review" });
  }
};

export { listReviews, saveReview };
