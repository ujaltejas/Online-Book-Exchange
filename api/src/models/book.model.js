import mongoose from "mongoose";
import { CATEGORIES, CONDITIONS, EXCHANGE_TYPES, STATUSES } from "../utils/constants.js";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, enum: CATEGORIES },
    condition: { type: String, required: true, enum: CONDITIONS },
    exchangeType: { type: String, required: true, enum: EXCHANGE_TYPES },
    status: { type: String, enum: STATUSES, default: "available" },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    university: { type: String, required: true, trim: true, maxlength: 120 },
    college: { type: String, required: true, trim: true, maxlength: 120 },
    images: [{ url: String, public_id: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

bookSchema.index({ owner: 1, createdAt: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ category: 1, status: 1 });

const Book = mongoose.model("Book", bookSchema);
export default Book;
