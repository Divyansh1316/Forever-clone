import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
  },
  { minimize: false } //this prevents Mongoose from automatically removing empty objects (cartData) from documents.
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
