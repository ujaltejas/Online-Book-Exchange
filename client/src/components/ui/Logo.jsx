import { Link } from "react-router-dom";

export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1f5c47" />
      <rect x="14" y="16" width="10" height="32" rx="1.5" fill="#f2f5f2" />
      <rect x="27" y="10" width="10" height="38" rx="1.5" fill="#c79a2e" />
      <rect x="40" y="20" width="10" height="28" rx="1.5" fill="#f2f5f2" transform="rotate(8 45 48)" />
      <rect x="10" y="48" width="44" height="4" rx="2" fill="#143d30" />
    </svg>
  );
}

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="BookSwap home">
      <LogoMark />
      <span className={`text-[22px] font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>BookSwap</span>
    </Link>
  );
}
