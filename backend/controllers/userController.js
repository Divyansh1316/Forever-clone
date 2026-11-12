import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/security.js";

const createToken = (id) => {
  return jwt.sign({ id: id.toString() }, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: "7d",
  });
};

const findUserByEmail = async (email) => {
  const exactMatch = await userModel.findOne({ email });
  if (exactMatch) return exactMatch;
  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return userModel.findOne({ email: { $regex: `^${escapedEmail}$`, $options: "i" } });
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (
      typeof email !== "string" || email.length > 254 ||
      typeof password !== "string" || Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const user = await findUserByEmail(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch {
    res.status(500).json({ success: false, message: "Unable to sign in" });
  }
};

// Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 254 ||
      name.trim().length < 1 ||
      name.trim().length > 100 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({ success: false, message: "Invalid registration details" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    //checking if user already exists or not
    const exists = await findUserByEmail(normalizedEmail);

    if (exists) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // validating email format and strong password
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    //hasing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }
    res.status(500).json({ success: false, message: "Unable to register" });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return res.status(503).json({ success: false, message: "Admin login is not configured" });
    }

    if (
      typeof email === "string" &&
      typeof password === "string" &&
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ role: "admin" }, getJwtSecret(), {
        algorithm: "HS256",
        expiresIn: "8h",
      });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch {
    res.status(500).json({ success: false, message: "Unable to sign in" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("name email").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, profile: user });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load profile" });
  }
};

export { loginUser, registerUser, adminLogin, getProfile };
