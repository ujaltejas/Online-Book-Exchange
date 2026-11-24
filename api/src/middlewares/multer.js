import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import { MAX_IMAGES } from "../utils/constants.js";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Memory storage: files go straight to Cloudinary and never touch the server's disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES },
  fileFilter: (_req, file, cb) =>
    ALLOWED.has(file.mimetype)
      ? cb(null, true)
      : cb(new ApiError(400, "Only JPG, PNG or WebP images are allowed.")),
});

export const uploadAvatar = upload.single("image");
export const uploadBookImages = upload.array("images", MAX_IMAGES);
