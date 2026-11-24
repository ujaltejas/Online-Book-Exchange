import User from "../models/user.model.js";
import Book from "../models/book.model.js";
import ContactRequest from "../models/contactRequest.model.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { clean, escapeRegex, isObjectId, toInt } from "../utils/validate.js";
import { deleteImages } from "../utils/cloudinary.js";
import { publicUser } from "../utils/serializers.js";

export const listUsers = asyncHandler(async (req, res) => {
  const q = clean(req.query.q, 100);
  const filter = { _id: { $ne: req.user._id } };
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ username: rx }, { email: rx }];
  }
  const page = toInt(req.query.page, 1, 1, 10_000);
  const limit = toInt(req.query.limit, 15, 1, 50);

  const [users, total] = await Promise.all([
    User.find(filter).sort("-createdAt").skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);

  const counts = await Book.aggregate([
    { $match: { owner: { $in: users.map((u) => u._id) } } },
    { $group: { _id: "$owner", count: { $sum: 1 } } },
  ]);
  const byOwner = new Map(counts.map((c) => [String(c._id), c.count]));

  res.json({
    users: users.map((u) => ({ ...publicUser(u), bookCount: byOwner.get(String(u._id)) || 0 })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw new ApiError(404, "User not found.");
  const user = await User.findById(req.params.id).select("+avatarPublicId");
  if (!user) throw new ApiError(404, "User not found.");
  if (String(user._id) === String(req.user._id)) throw new ApiError(400, "You cannot delete your own account here.");
  if (user.role === "admin") throw new ApiError(403, "Admin accounts cannot be deleted from the dashboard.");

  // Cascade: remove the user's listings (and their images) so nothing is left orphaned.
  const books = await Book.find({ owner: user._id }).select("images");
  await deleteImages([user.avatarPublicId, ...books.flatMap((b) => b.images.map((i) => i.public_id))]);
  await ContactRequest.deleteMany({ $or: [{ requester: user._id }, { owner: user._id }] });
  await Book.deleteMany({ owner: user._id });
  await user.deleteOne();

  res.json({ message: "User and their listings were deleted.", deletedBooks: books.length });
});

const SINCE_DAYS = { week: 7, month: 30, year: 365 };

export const getReport = asyncHandler(async (req, res) => {
  const timeframe = SINCE_DAYS[req.query.timeframe] ? req.query.timeframe : "all";
  const since = SINCE_DAYS[timeframe] ? new Date(Date.now() - SINCE_DAYS[timeframe] * 86_400_000) : null;
  const match = since ? { createdAt: { $gte: since } } : {};

  const group = (field) =>
    Book.aggregate([
      { $match: match },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, label: "$_id", count: 1 } },
    ]);

  const [users, admins, books, requests, byCategory, byCondition, byType, byStatus, topUniversities] =
    await Promise.all([
      User.countDocuments(match),
      User.countDocuments({ ...match, role: "admin" }),
      Book.countDocuments(match),
      ContactRequest.countDocuments(match),
      group("category"),
      group("condition"),
      group("exchangeType"),
      group("status"),
      Book.aggregate([
        { $match: match },
        { $group: { _id: { $toLower: "$university" }, label: { $first: "$university" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, label: 1, count: 1 } },
      ]),
    ]);

  res.json({
    timeframe,
    generatedAt: new Date().toISOString(),
    totals: { users, admins, books, contactRequests: requests },
    byCategory,
    byCondition,
    byType,
    byStatus,
    topUniversities,
  });
});
