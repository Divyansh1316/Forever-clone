import "dotenv/config";

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  configuredOrigins.push("http://localhost:5173", "http://localhost:5174");
}

export const allowedOrigins = new Set(configuredOrigins);

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or too short. Set a random value of at least 32 characters in backend/.env or the process environment."
    );
  }
  return secret;
};
