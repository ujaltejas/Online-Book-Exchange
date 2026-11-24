import express from "express";
import { protect, requireAdmin } from "../middlewares/auth.middleware.js";
import { deleteUser, getReport, listUsers } from "../controllers/admin.controller.js";

const router = express.Router();
router.use(protect, requireAdmin);

router.get("/users", listUsers);
router.delete("/users/:id", deleteUser);
router.get("/report", getReport);

export default router;
