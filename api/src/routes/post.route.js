import express from "express";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getUserBooks,
  manageBookImages,
  contactBookOwner,
} from "../controllers/book.controller.js";

const router = express.Router();

router.get("/", getAllBooks);

router.get("/user", protect, getUserBooks);
router.get("/user/:userId", protect, getUserBooks);

router.get("/:id", getBookById);

router.post("/", protect, upload.array("images", 10), createBook);

router.put("/:id", protect, upload.array("images", 10), updateBook);

router.delete("/:id", protect, deleteBook);

router.patch("/:id/images", protect, upload.array("images", 10), manageBookImages);

router.post("/:id/contact", contactBookOwner);

export default router;
