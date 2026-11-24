import { v2 as cloudinary } from "cloudinary";
import { env, isCloudinaryConfigured } from "../config/env.js";
import { ApiError } from "./ApiError.js";

cloudinary.config({ ...env.CLOUDINARY, secure: true });

/** Upload an in-memory image buffer. Nothing is written to local disk. */
export const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new ApiError(503, "Image uploads are not configured on this server."));
    }
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto" }],
      },
      (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, public_id: result.public_id }))
    );
    stream.end(buffer);
  });

/** Upload several files; if any fail, remove the ones that succeeded. */
export const uploadMany = async (files, folder) => {
  const results = await Promise.allSettled(files.map((f) => uploadBuffer(f.buffer, folder)));
  const ok = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  if (ok.length !== files.length) {
    await deleteImages(ok.map((i) => i.public_id));
    const apiErr = results.find((r) => r.status === "rejected" && r.reason instanceof ApiError);
    throw apiErr ? apiErr.reason : new ApiError(502, "Image upload failed. Please try again.");
  }
  return ok;
};

/** Best-effort cleanup. Never throws. */
export const deleteImages = async (publicIds = []) => {
  const ids = publicIds.filter(Boolean);
  if (!ids.length || !isCloudinaryConfigured()) return;
  await Promise.allSettled(ids.map((id) => cloudinary.uploader.destroy(id)));
};
