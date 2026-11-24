export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export const isString = (v) => typeof v === "string";

/** Trim and cap a value. Anything that is not a string becomes "". */
export const clean = (v, max = 500) => (isString(v) ? v.trim().slice(0, max) : "");

export const normalizeEmail = (v) => clean(v, 254).toLowerCase();
export const isEmail = (v) => isString(v) && v.length <= 254 && EMAIL_RE.test(v);
export const isObjectId = (v) => isString(v) && OBJECT_ID_RE.test(v);

export const toInt = (v, fallback, min, max) => {
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
