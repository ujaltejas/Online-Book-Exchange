import express from "express";
import { login, logout, me, register, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { uploadAvatar } from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", authLimiter, uploadAvatar, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.put("/profile", protect, uploadAvatar, updateProfile);

export default router;
