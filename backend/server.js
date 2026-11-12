import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { allowedOrigins, getJwtSecret } from "./config/security.js";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import favoriteRouter from "./routes/favoriteRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;
getJwtSecret();
connectDB().catch((error) => {
  const errorType = error?.name || "UnknownError";
  const errorCode = error?.code ? ` (${String(error.code)})` : "";
  console.error(
    `Database connection failed: ${errorType}${errorCode}. Check the MongoDB URI, credentials, cluster status, and network access rules.`
  );
});
connectCloudinary();

// middlewares
app.disable("x-powered-by");
if (process.env.VERCEL === "1") app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  })
);
app.use(
  "/api/user",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/favorites", favoriteRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use((error, _req, res, _next) => {
  if (error?.code?.startsWith("LIMIT_")) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or oversized upload" });
  }
  res.status(400).json({ success: false, message: "Invalid request" });
});

// Start the Express server and listen on the specified port.

if (process.env.VERCEL !== "1") {
  app.listen(port, () => console.log(`Server started on port ${port}`));
}

export default app;
