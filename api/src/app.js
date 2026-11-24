import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import adminRoute from "./routes/admin.route.js";
import { errorHandler, notFound } from "./middlewares/error.js";

const app = express();

app.disable("x-powered-by");
if (env.TRUST_PROXY) app.set("trust proxy", env.TRUST_PROXY);

// Minimal security headers. For a full set, add the `helmet` package.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || env.CLIENT_ORIGINS.includes(origin)),
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);
app.use("/api/admin", adminRoute);

app.use(notFound);
app.use(errorHandler);

export default app;
