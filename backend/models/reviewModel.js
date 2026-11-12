import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true, maxlength: 100 },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, createdAt: -1 });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
