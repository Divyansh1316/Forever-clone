import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/security.js";

const authUser = async (req, res, next) => {
  const token = req.get("token");

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const tokenDecode = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    if (typeof tokenDecode.id !== "string" || typeof tokenDecode.exp !== "number") {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    req.userId = tokenDecode.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

export default authUser;
