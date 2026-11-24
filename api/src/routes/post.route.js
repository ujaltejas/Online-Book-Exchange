import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadBookImages } from "../middlewares/multer.js";
import { contactLimiter } from "../middlewares/rateLimit.js";
import {
  contactBookOwner,
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  getMyBooks,
  setBookStatus,
  updateBook,
} from "../controllers/book.controller.js";

const router = express.Router();

router.get("/", getAllBooks);
router.get("/mine", protect, getMyBooks); // must stay above "/:id"
router.get("/:id", getBookById);

router.post("/", protect, uploadBookImages, createBook);
router.put("/:id", protect, uploadBookImages, updateBook);
router.patch("/:id/status", protect, setBookStatus);
router.delete("/:id", protect, deleteBook);

router.post("/:id/contact", protect, contactLimiter, contactBookOwner);

export default router;
