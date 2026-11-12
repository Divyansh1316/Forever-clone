import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/security.js";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.get("token");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
    const tokenDecode = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    if (tokenDecode.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

export default adminAuth;
