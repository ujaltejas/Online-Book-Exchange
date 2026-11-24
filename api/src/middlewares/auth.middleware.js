import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { env } from "../config/env.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new ApiError(401, "Please sign in to continue.");

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "This account no longer exists.");

  req.user = user;
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== "admin") return next(new ApiError(403, "Administrator access required."));
  next();
};

export default protect;
