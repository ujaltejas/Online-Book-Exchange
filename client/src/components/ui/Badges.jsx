import { statusLabel, typeLabel } from "../../lib/constants";

const STATUS_STYLE = {
  available: "bg-lamp-tint text-lamp-deep",
  reserved: "bg-[#f6ecd2] text-brass-deep",
  exchanged: "bg-[#e6eae8] text-ink-soft",
};
const DOT = { available: "bg-lamp", reserved: "bg-brass", exchanged: "bg-ink-soft" };

export function StatusBadge({ status = "available" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {statusLabel(status)}
    </span>
  );
}

export function TypeBadge({ type }) {
  const free = type === "free";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        free ? "bg-brass text-ink" : "border border-lamp/40 text-lamp"
      }`}
    >
      {typeLabel(type)}
    </span>
  );
}
