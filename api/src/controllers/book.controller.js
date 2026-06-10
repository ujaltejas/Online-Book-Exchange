import Book from "../models/book.model.js";
import User from "../models/user.model.js";
import uploadImage from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";

const USER_BOOK_LIMIT = 20;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createBook = async (req, res) => {
  try {
    const { title, author, category, condition, exchangeType, description, university, college } =
      req.body;

    if (req.user.role === "user") {
      const userBookCount = await Book.countDocuments({ owner: req.user.id });
      if (userBookCount >= USER_BOOK_LIMIT) {
        return res.status(403).json({
          success: false,
          message: `Regular users can list up to ${USER_BOOK_LIMIT} books.`,
        });
      }
    }

    if (
      !title ||
      !author ||
      !category ||
      !condition ||
      !exchangeType ||
      !description ||
      !university?.trim() ||
      !college?.trim()
    ) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file) => uploadImage(file.path));
      const imageUrls = await Promise.all(imagePromises);
      images = imageUrls.map((url) => ({
        url,
        public_id: url.split("/").pop().split(".")[0],
      }));
    }

    const newBook = new Book({
      title,
      author,
      category,
      condition,
      exchangeType,
      description,
      university: university.trim(),
      college: college.trim(),
      images,
      owner: req.user.id,
    });

    const savedBook = await newBook.save();

    await User.findByIdAndUpdate(req.user.id, { $push: { listings: savedBook._id } });

    res.status(201).json({
      success: true,
      book: savedBook,
    });
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({
      success: false,
      message: "Error creating book",
      error: error.message,
    });
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const {
      category,
      condition,
      exchangeType,
      q,
      university,
      college,
      excludeOwner,
      sort = "-createdAt",
    } = req.query;

    const query = {};
    const andParts = [];

    if (excludeOwner) {
      query.owner = { $ne: excludeOwner };
    }
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (exchangeType) query.exchangeType = exchangeType;

    if (university && university.trim()) {
      andParts.push({
        university: new RegExp(escapeRegex(university.trim()), "i"),
      });
    }
    if (college && college.trim()) {
      andParts.push({
        college: new RegExp(escapeRegex(college.trim()), "i"),
      });
    }
    if (q && q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), "i");
      andParts.push({
        $or: [{ title: rx }, { author: rx }, { university: rx }, { college: rx }],
      });
    }

    if (andParts.length > 0) {
      query.$and = andParts;
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const books = await Book.find(query)
      .populate("owner", "username email avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching books",
      error: error.message,
    });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "owner",
      "username email avatar role"
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error fetching book",
      error: error.message,
    });
  }
};

export const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    let book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this book",
      });
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file) => uploadImage(file.path));
      const imageUrls = await Promise.all(imagePromises);
      newImages = imageUrls.map((url) => ({
        url,
        public_id: url.split("/").pop().split(".")[0],
      }));
    }

    let currentImages = [...(book.images || [])];
    if (req.body.removedImages) {
      const removedImageIds = JSON.parse(req.body.removedImages);
      currentImages = currentImages.filter(
        (img) => !removedImageIds.includes(img._id.toString())
      );
    }

    const allowed = [
      "title",
      "author",
      "category",
      "condition",
      "exchangeType",
      "description",
      "university",
      "college",
    ];
    const updateData = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined && req.body[key] !== "") {
        const v = req.body[key];
        updateData[key] =
          key === "university" || key === "college" ? String(v).trim() : v;
      }
    }
    updateData.images = [...currentImages, ...newImages];

    const updatedBook = await Book.findByIdAndUpdate(bookId, updateData, {
      new: true,
      runValidators: true,
    }).populate("owner", "username email avatar");

    res.status(200).json({
      success: true,
      book: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      success: false,
      message: "Error updating book",
      error: error.message,
    });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this book",
      });
    }

    await User.findByIdAndUpdate(book.owner, { $pull: { listings: bookId } });
    await Book.findByIdAndDelete(bookId);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting book",
      error: error.message,
    });
  }
};

export const getUserBooks = async (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId || req.user.id;

    const books = await Book.find({ owner: userId }).sort("-createdAt");

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Error fetching user books:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user books",
      error: error.message,
    });
  }
};

export const manageBookImages = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const { action } = req.query;

    if (!["add", "remove"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'add' or 'remove'",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this book",
      });
    }

    if (action === "add") {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No images provided",
        });
      }

      const imagePromises = req.files.map((file) => uploadImage(file.path));
      const imageUrls = await Promise.all(imagePromises);
      const newImages = imageUrls.map((url) => ({
        url,
        public_id: url.split("/").pop().split(".")[0],
      }));

      const updatedBook = await Book.findByIdAndUpdate(
        bookId,
        { $push: { images: { $each: newImages } } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Images added successfully",
        book: updatedBook,
      });
    }

    const { imageId } = req.body;
    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $pull: { images: { public_id: imageId } } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Image removed successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error("Error managing book images:", error);
    res.status(500).json({
      success: false,
      message: "Error managing book images",
      error: error.message,
    });
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const contactBookOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const book = await Book.findById(id).populate("owner", "email username");

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (!book.owner?.email) {
      return res.status(400).json({
        success: false,
        message: "Book owner email is not available",
      });
    }

    await sendEmail({
      to: book.owner.email,
      replyTo: email,
      subject: `Interest in your book: ${book.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>Someone wants to contact you about your book</h2>
          <p>Hello ${escapeHtml(book.owner.username || "Book Owner")},</p>
          <p>A user is interested in your listing on Online Book Exchange.</p>

          <h3>Book Details</h3>
          <p><strong>Title:</strong> ${escapeHtml(book.title)}</p>
          <p><strong>Author:</strong> ${escapeHtml(book.author)}</p>
          <p><strong>Category:</strong> ${escapeHtml(book.category)}</p>
          <p><strong>Condition:</strong> ${escapeHtml(book.condition)}</p>
          <p><strong>University:</strong> ${escapeHtml(book.university || "-")}</p>
          <p><strong>College:</strong> ${escapeHtml(book.college || "-")}</p>
          <p><strong>Listing Type:</strong> ${book.exchangeType === "free" ? "Free / Donation" : "Exchange"}</p>

          <h3>Interested User Details</h3>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>

          <h3>Message</h3>
          <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>

          <hr />
          <p>You can reply directly to this email to continue the exchange offline.</p>
          <p><em>No payment is processed by the platform.</em></p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully to the book owner",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending email",
      error: error.message,
    });
  }
};
