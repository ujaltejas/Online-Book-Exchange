import multer from "multer";
import { env } from "../config/env.js";

export const notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  if (res.headersSent) return;

  if (err.expose && err.status) return res.status(err.status).json({ message: err.message });

  if (err instanceof multer.MulterError) {
    const map = {
      LIMIT_FILE_SIZE: [413, "Each image must be 5 MB or smaller."],
      LIMIT_FILE_COUNT: [400, "You can upload up to 10 images."],
      LIMIT_UNEXPECTED_FILE: [400, "Unexpected file field."],
    };
    const [status, message] = map[err.code] || [400, "Upload failed."];
    return res.status(status).json({ message });
  }

  if (err.name === "ValidationError") {
    const first = Object.values(err.errors || {})[0]?.message;
    return res.status(400).json({ message: first || "Some fields are invalid." });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid identifier." });
  if (err.code === 11000) return res.status(409).json({ message: "That value is already in use." });
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Malformed JSON body." });
  if (err.type === "entity.too.large") return res.status(413).json({ message: "Request body too large." });

  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ message: "Something went wrong on our side.", ...(env.isProd ? {} : { detail: err.message }) });
};
