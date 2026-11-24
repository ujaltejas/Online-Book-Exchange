// Keep in sync with api/src/utils/constants.js
export const CATEGORIES = ["Engineering", "Medical", "Fiction", "Science", "Arts", "Commerce", "Law", "Other"];
export const CONDITIONS = ["New", "Good", "Used"];
export const EXCHANGE_TYPES = [
  { value: "exchange", label: "Swap" },
  { value: "free", label: "Free" },
];
export const STATUSES = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "exchanged", label: "Exchanged" },
];
export const MAX_IMAGES = 10;
export const MAX_IMAGE_MB = 5;

// Each category has a spine colour that follows it everywhere: hero shelf, cards, detail page.
export const CATEGORY_STYLE = {
  Engineering: { bg: "#2b4c9b", fg: "#ffffff" },
  Medical: { bg: "#7a2e4d", fg: "#ffffff" },
  Fiction: { bg: "#c79a2e", fg: "#15281f" },
  Science: { bg: "#2f7f86", fg: "#ffffff" },
  Arts: { bg: "#9c4a2f", fg: "#ffffff" },
  Commerce: { bg: "#1f5c47", fg: "#ffffff" },
  Law: { bg: "#3e4a59", fg: "#ffffff" },
  Other: { bg: "#6b5b8c", fg: "#ffffff" },
};
export const categoryStyle = (c) => CATEGORY_STYLE[c] || CATEGORY_STYLE.Other;

export const typeLabel = (v) => EXCHANGE_TYPES.find((t) => t.value === v)?.label || v;
export const statusLabel = (v) => STATUSES.find((s) => s.value === v)?.label || v;

// Suggestions only; users can type any campus.
export const CAMPUS_SUGGESTIONS = [
  "University of Mumbai",
  "IIT Bombay",
  "Savitribai Phule Pune University",
  "Delhi University",
  "Anna University",
  "VJTI Mumbai",
  "NMIMS",
  "Manipal Academy of Higher Education",
];
