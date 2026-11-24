import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { clean, isEmail, isString, normalizeEmail } from "../utils/validate.js";
import { clearAuthCookie, setAuthCookie } from "../utils/jwt.js";
import { deleteImages, uploadBuffer } from "../utils/cloudinary.js";
import { publicUser } from "../utils/serializers.js";

// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = await bcrypt.hash("not-a-real-password", 12);

const validatePassword = (password) => {
  if (!isString(password) || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }
  if (Buffer.byteLength(password) > 72) throw new ApiError(400, "Password must be 72 bytes or fewer.");
};

export const register = asyncHandler(async (req, res) => {
  // `role` is deliberately never read from the request: accounts are always created as "user".
  const username = clean(req.body.username, 40);
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (username.length < 2) throw new ApiError(400, "Username must be at least 2 characters.");
  if (!isEmail(email)) throw new ApiError(400, "Please enter a valid email address.");
  validatePassword(password);

  if (await User.exists({ email })) throw new ApiError(409, "An account with this email already exists.");

  let avatar = "";
  let avatarPublicId = "";
  if (req.file) {
    const up = await uploadBuffer(req.file.buffer, "bookswap/avatars");
    avatar = up.url;
    avatarPublicId = up.public_id;
  }

  let user;
  try {
    user = await User.create({ username, email, password, avatar, avatarPublicId });
  } catch (err) {
    await deleteImages([avatarPublicId]);
    throw err;
  }

  setAuthCookie(res, user);
  res.status(201).json({ user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  if (!isEmail(email) || !isString(password) || !password) {
    throw new ApiError(400, "Enter your email and password.");
  }

  const user = await User.findOne({ email }).select("+password");
  const ok = user ? await user.comparePassword(password) : await bcrypt.compare(password, DUMMY_HASH).then(() => false);
  if (!user || !ok) throw new ApiError(401, "Email or password is incorrect.");

  setAuthCookie(res, user);
  res.json({ user: publicUser(user) });
});

// Public on purpose: signing out must work even when the session has already expired.
export const logout = (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Signed out." });
};

export const me = (req, res) => res.json({ user: publicUser(req.user) });

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+avatarPublicId");
  const username = clean(req.body.username, 40);
  const email = normalizeEmail(req.body.email);

  if (req.body.username !== undefined) {
    if (username.length < 2) throw new ApiError(400, "Username must be at least 2 characters.");
    user.username = username;
  }
  if (req.body.email !== undefined && email !== user.email) {
    if (!isEmail(email)) throw new ApiError(400, "Please enter a valid email address.");
    if (await User.exists({ email, _id: { $ne: user._id } })) {
      throw new ApiError(409, "That email is already used by another account.");
    }
    user.email = email;
  }

  let oldAvatarId = "";
  let newAvatarId = "";
  if (req.file) {
    const up = await uploadBuffer(req.file.buffer, "bookswap/avatars");
    oldAvatarId = user.avatarPublicId;
    newAvatarId = up.public_id;
    user.avatar = up.url;
    user.avatarPublicId = up.public_id;
  }

  try {
    await user.save();
  } catch (err) {
    await deleteImages([newAvatarId]);
    throw err;
  }
  await deleteImages([oldAvatarId]);

  res.json({ user: publicUser(user) });
});
