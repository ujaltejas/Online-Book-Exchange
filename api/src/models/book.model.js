import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Engineering",
        "Medical",
        "Fiction",
        "Science",
        "Arts",
        "Commerce",
        "Law",
        "Other",
      ],
    },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Good", "Used"],
    },
    exchangeType: {
      type: String,
      required: true,
      enum: ["exchange", "free"],
    },
    description: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
