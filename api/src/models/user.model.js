import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { EMAIL_RE } from "../utils/validate.js";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [EMAIL_RE, "Please provide a valid email address."],
    },
    // select:false keeps the hash out of every query unless explicitly requested.
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: "", select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.avatarPublicId;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
