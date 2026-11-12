import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";

const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

//function for add product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body || {};

    if (
      typeof name !== "string" || name.trim().length < 1 || name.length > 160 ||
      typeof description !== "string" || description.length > 5000 ||
      typeof category !== "string" || category.length > 100 ||
      typeof subCategory !== "string" || subCategory.length > 100 ||
      !Number.isFinite(Number(price)) || Number(price) <= 0
    ) {
      return res.status(400).json({ success: false, message: "Invalid product details" });
    }

    let parsedSizes;
    try {
      parsedSizes = JSON.parse(sizes);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid product sizes" });
    }
    if (!Array.isArray(parsedSizes) || parsedSizes.length === 0 || parsedSizes.length > 20 || parsedSizes.some((size) => typeof size !== "string" || size.length > 30)) {
      return res.status(400).json({ success: false, message: "Invalid product sizes" });
    }

    const images = Object.values(req.files || {}).flat();
    if (images.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product image is required" });
    }
    const imagesUrl = await Promise.all(images.map((image) => uploadImage(image.buffer)));

    const productData = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: Number(price), //converting string to number
      subCategory: subCategory.trim(),
      bestseller: bestseller === "true" ? true : false, //converting string to boolean
      sizes: parsedSizes,
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product added" });
  } catch {
    res.status(500).json({ success: false, message: "Unable to add product" });
  }
};

//function for list product
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({}).lean();
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json({ success: true, products });
  } catch {
    res.status(500).json({ success: false, message: "Unable to list products" });
  }
};

//function for remove product
const removeProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body?.id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    const product = await productModel.findByIdAndDelete(req.body.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product Removed" });
  } catch {
    res.status(500).json({ success: false, message: "Unable to remove product" });
  }
};

//function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load product" });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct };
