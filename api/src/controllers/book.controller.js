import Book from "../models/book.model.js";
import ContactRequest from "../models/contactRequest.model.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { CATEGORIES, CONDITIONS, EXCHANGE_TYPES, MAX_IMAGES, STATUSES, USER_BOOK_LIMIT } from "../utils/constants.js";
import { clean, escapeRegex, isObjectId, isString, toInt } from "../utils/validate.js";
import { deleteImages, uploadMany } from "../utils/cloudinary.js";
import { publicBook } from "../utils/serializers.js";
import { sendEmail } from "../utils/sendEmail.js";
import { contactOwnerEmail } from "../utils/emailTemplates.js";

const OWNER_FIELDS = "username avatar";
const SORTS = { newest: "-createdAt", oldest: "createdAt", title: "title" };

const TEXT_RULES = {
  title: { label: "Title", min: 2, max: 150 },
  author: { label: "Author", min: 2, max: 120 },
  description: { label: "Description", min: 10, max: 2000 },
  university: { label: "University", min: 2, max: 120 },
  college: { label: "College", min: 2, max: 120 },
};
const ENUM_RULES = {
  category: { label: "Category", values: CATEGORIES },
  condition: { label: "Condition", values: CONDITIONS },
  exchangeType: { label: "Listing type", values: EXCHANGE_TYPES },
};

/** Validate book fields. With partial=true only the provided fields are checked. */
const parseBookFields = (body, { partial }) => {
  const out = {};
  for (const [key, { label, min, max }] of Object.entries(TEXT_RULES)) {
    if (body[key] === undefined) {
      if (!partial) throw new ApiError(400, `${label} is required.`);
      continue;
    }
    const value = clean(body[key], max + 1);
    if (value.length < min) throw new ApiError(400, `${label} must be at least ${min} characters.`);
    if (value.length > max) throw new ApiError(400, `${label} must be ${max} characters or fewer.`);
    out[key] = value;
  }
  for (const [key, { label, values }] of Object.entries(ENUM_RULES)) {
    if (body[key] === undefined) {
      if (!partial) throw new ApiError(400, `${label} is required.`);
      continue;
    }
    if (!isString(body[key]) || !values.includes(body[key])) throw new ApiError(400, `${label} is not valid.`);
    out[key] = body[key];
  }
  return out;
};

const findOwnedBook = async (req) => {
  if (!isObjectId(req.params.id)) throw new ApiError(404, "Book not found.");
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, "Book not found.");
  const isOwner = String(book.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") throw new ApiError(403, "You can only change your own listings.");
  return book;
};

export const createBook = asyncHandler(async (req, res) => {
  if (req.user.role === "user") {
    const count = await Book.countDocuments({ owner: req.user._id });
    if (count >= USER_BOOK_LIMIT) {
      throw new ApiError(403, `You can list up to ${USER_BOOK_LIMIT} books. Remove one to add another.`);
    }
  }

  const fields = parseBookFields(req.body, { partial: false });
  const images = await uploadMany(req.files || [], "bookswap/books");

  let book;
  try {
    book = await Book.create({ ...fields, images, owner: req.user._id });
  } catch (err) {
    await deleteImages(images.map((i) => i.public_id));
    throw err;
  }
  await book.populate("owner", OWNER_FIELDS);
  res.status(201).json({ book: publicBook(book) });
});

export const getAllBooks = asyncHandler(async (req, res) => {
  const q = clean(req.query.q, 100);
  const university = clean(req.query.university, 100);
  const college = clean(req.query.college, 100);
  const filter = {};

  // Only plain strings from the allow-lists reach the query, which blocks operator injection like ?category[$ne]=x
  for (const [key, { values }] of Object.entries(ENUM_RULES)) {
    if (isString(req.query[key]) && values.includes(req.query[key])) filter[key] = req.query[key];
  }
  if (isString(req.query.status) && STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (isObjectId(req.query.excludeOwner)) filter.owner = { $ne: req.query.excludeOwner };

  const and = [];
  if (university) and.push({ university: new RegExp(escapeRegex(university), "i") });
  if (college) and.push({ college: new RegExp(escapeRegex(college), "i") });
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    and.push({ $or: [{ title: rx }, { author: rx }, { university: rx }, { college: rx }] });
  }
  if (and.length) filter.$and = and;

  const page = toInt(req.query.page, 1, 1, 10_000);
  const limit = toInt(req.query.limit, 12, 1, 50);
  const sort = SORTS[req.query.sort] || SORTS.newest;

  const [books, total] = await Promise.all([
    Book.find(filter)
      .populate("owner", OWNER_FIELDS)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Book.countDocuments(filter),
  ]);

  res.json({ books: books.map(publicBook), total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const getBookById = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw new ApiError(404, "Book not found.");
  const book = await Book.findById(req.params.id).populate("owner", OWNER_FIELDS);
  if (!book) throw new ApiError(404, "Book not found.");
  res.json({ book: publicBook(book) });
});

export const getMyBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ owner: req.user._id }).populate("owner", OWNER_FIELDS).sort("-createdAt");
  res.json({ books: books.map(publicBook), limit: req.user.role === "user" ? USER_BOOK_LIMIT : null });
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await findOwnedBook(req);
  const fields = parseBookFields(req.body, { partial: true });

  let removeIds = [];
  if (req.body.removedImages) {
    try {
      const parsed = JSON.parse(req.body.removedImages);
      if (Array.isArray(parsed)) removeIds = parsed.map(String);
    } catch {
      throw new ApiError(400, "removedImages must be valid JSON.");
    }
  }
  const toRemove = book.images.filter((img) => removeIds.includes(String(img._id)));
  const kept = book.images.filter((img) => !removeIds.includes(String(img._id)));
  const files = req.files || [];
  if (kept.length + files.length > MAX_IMAGES) {
    throw new ApiError(400, `A listing can have up to ${MAX_IMAGES} photos.`);
  }

  const uploaded = await uploadMany(files, "bookswap/books");
  try {
    book.set(fields);
    book.images = [...kept, ...uploaded];
    await book.save();
  } catch (err) {
    await deleteImages(uploaded.map((i) => i.public_id));
    throw err;
  }
  await deleteImages(toRemove.map((i) => i.public_id));

  await book.populate("owner", OWNER_FIELDS);
  res.json({ book: publicBook(book) });
});

export const setBookStatus = asyncHandler(async (req, res) => {
  const book = await findOwnedBook(req);
  if (!isString(req.body.status) || !STATUSES.includes(req.body.status)) {
    throw new ApiError(400, "Status must be available, reserved or exchanged.");
  }
  book.status = req.body.status;
  await book.save();
  await book.populate("owner", OWNER_FIELDS);
  res.json({ book: publicBook(book) });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await findOwnedBook(req);
  await deleteImages(book.images.map((i) => i.public_id));
  await ContactRequest.deleteMany({ book: book._id });
  await book.deleteOne();
  res.json({ message: "Listing deleted." });
});

export const contactBookOwner = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw new ApiError(404, "Book not found.");
  const message = clean(req.body.message, 1000);
  const phone = clean(req.body.phone, 30);
  if (message.length < 10) throw new ApiError(400, "Write a message of at least 10 characters.");
  if (phone && !/^[+\d][\d\s()-]{5,}$/.test(phone)) throw new ApiError(400, "Enter a valid phone number or leave it empty.");

  const book = await Book.findById(req.params.id).populate("owner", "username email");
  if (!book || !book.owner) throw new ApiError(404, "Book not found.");
  if (String(book.owner._id) === String(req.user._id)) throw new ApiError(400, "This is your own listing.");
  if (book.status === "exchanged") throw new ApiError(409, "This book has already been exchanged.");

  const recent = await ContactRequest.exists({
    book: book._id,
    requester: req.user._id,
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
  });
  if (recent) throw new ApiError(429, "You already messaged this owner a moment ago. Give them a few minutes to reply.");

  const request = await ContactRequest.create({
    book: book._id,
    requester: req.user._id,
    owner: book.owner._id,
    message,
    phone,
  });

  const mail = contactOwnerEmail({ owner: book.owner, book, requester: req.user, phone, message });
  try {
    await sendEmail({ to: book.owner.email, replyTo: req.user.email, ...mail });
    request.emailStatus = "sent";
    await request.save();
  } catch (err) {
    console.error("[contact] email failed:", err.message);
    request.emailStatus = "failed";
    await request.save();
    throw new ApiError(502, "We could not deliver your message right now. Please try again later.");
  }

  res.json({ message: `Message sent to ${book.owner.username}. They can reply to your email.` });
});
