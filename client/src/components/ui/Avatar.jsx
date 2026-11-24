import { initials } from "../../lib/format";

const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-xl", xl: "h-24 w-24 text-3xl" };

export default function Avatar({ user, size = "md", className = "" }) {
  const cls = `${SIZES[size]} shrink-0 rounded-full ${className}`;
  if (user?.avatar) {
    return <img src={user.avatar} alt="" className={`${cls} object-cover`} loading="lazy" />;
  }
  return (
    <span className={`${cls} inline-flex items-center justify-center bg-lamp-tint font-bold text-lamp-deep`} aria-hidden="true">
      {initials(user?.username)}
    </span>
  );
}
