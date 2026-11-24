import "dotenv/config";

const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const NODE_ENV = process.env.NODE_ENV || "development";
const sameSite = ["lax", "strict", "none"].includes(process.env.COOKIE_SAMESITE)
  ? process.env.COOKIE_SAMESITE
  : "lax";

export const env = {
  NODE_ENV,
  isProd: NODE_ENV === "production",
  PORT: num(process.env.PORT, 3000),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/book-exchange",
  JWT_SECRET: process.env.JWT_SECRET || "",
  CLIENT_ORIGINS: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean),
  COOKIE_SAMESITE: sameSite,
  TRUST_PROXY: num(process.env.TRUST_PROXY, 0),
  EMAIL: {
    host: process.env.EMAIL_HOST || "",
    port: num(process.env.EMAIL_PORT, 587),
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
    from: process.env.EMAIL_FROM || "BookSwap <noreply@bookswap.local>",
  },
  CLOUDINARY: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

export const isCloudinaryConfigured = () =>
  Boolean(env.CLOUDINARY.cloud_name && env.CLOUDINARY.api_key && env.CLOUDINARY.api_secret);

export const isEmailConfigured = () =>
  Boolean(env.EMAIL.host && env.EMAIL.user && env.EMAIL.pass);

/** Returns { problems, warnings }. Problems should stop the server from starting. */
export const validateEnv = () => {
  const problems = [];
  const warnings = [];

  if (!env.JWT_SECRET) {
    problems.push("JWT_SECRET is not set.");
  } else if (env.JWT_SECRET.length < 32) {
    (env.isProd ? problems : warnings).push(
      "JWT_SECRET is shorter than 32 characters. Generate a long random one."
    );
  }
  if (!isCloudinaryConfigured()) warnings.push("Cloudinary is not configured: image uploads will fail.");
  if (!isEmailConfigured()) warnings.push("Email is not configured: contacting owners will fail.");
  return { problems, warnings };
};
