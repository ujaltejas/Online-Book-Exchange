// Usage:  npm run seed:admin -- you@example.com "Your Name"
// The password is read from ADMIN_PASSWORD (preferred, keeps it out of shell history) or the third argument.
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import User from "../src/models/user.model.js";
import { isEmail, normalizeEmail } from "../src/utils/validate.js";

const [, , emailArg, nameArg = "Admin", passArg] = process.argv;
const email = normalizeEmail(emailArg);
const password = process.env.ADMIN_PASSWORD || passArg;

if (!isEmail(email) || !password || password.length < 8) {
  console.error('Usage: ADMIN_PASSWORD="min 8 chars" npm run seed:admin -- you@example.com "Your Name"');
  process.exit(1);
}

await mongoose.connect(env.MONGODB_URI);
let user = await User.findOne({ email });
if (user) {
  user.role = "admin";
  await user.save();
  console.log(`Promoted existing user ${email} to admin.`);
} else {
  user = await User.create({ username: nameArg, email, password, role: "admin" });
  console.log(`Created admin ${email}.`);
}
await mongoose.disconnect();
