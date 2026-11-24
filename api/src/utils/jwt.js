import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd || env.COOKIE_SAMESITE === "none",
  sameSite: env.COOKIE_SAMESITE,
  path: "/",
});

/** The token carries only the user id. Role is always re-read from the database. */
export const signToken = (userId) => jwt.sign({ id: String(userId) }, env.JWT_SECRET, { expiresIn: "1d" });

export const setAuthCookie = (res, user) =>
  res.cookie("token", signToken(user._id), { ...cookieOptions(), maxAge: ONE_DAY_MS });

export const clearAuthCookie = (res) => res.clearCookie("token", cookieOptions());
