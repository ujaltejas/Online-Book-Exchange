import mongoose from "mongoose";

/** A record of every "contact the owner" message, so we can rate-limit and audit. */
const contactRequestSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 1000 },
    phone: { type: String, default: "", maxlength: 30 },
    emailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  },
  { timestamps: true, versionKey: false }
);

contactRequestSchema.index({ requester: 1, createdAt: -1 });

const ContactRequest = mongoose.model("ContactRequest", contactRequestSchema);
export default ContactRequest;
