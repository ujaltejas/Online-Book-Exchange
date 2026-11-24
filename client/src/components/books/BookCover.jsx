import { categoryStyle } from "../../lib/constants";

/** Real photo when there is one, otherwise a generated book cover in the category's spine colour. */
export default function BookCover({ book, className = "" }) {
  const { bg, fg } = categoryStyle(book.category);
  const photo = book.images?.[0]?.url;

  if (photo) {
    return <img src={photo} alt={`Cover of ${book.title}`} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{ background: `color-mix(in srgb, ${bg} 14%, white)` }}
      role="img"
      aria-label={`Generated cover for ${book.title}`}
    >
      <div
        className="relative flex h-[84%] aspect-[3/4] flex-col justify-between overflow-hidden rounded-[3px] p-[7%] pl-[15%] shadow-[2px_3px_0_rgba(21,40,31,0.18)]"
        style={{ background: bg, color: fg, containerType: "inline-size" }}
      >
        <span className="absolute inset-y-0 left-[8%] w-px bg-white/35" aria-hidden="true" />
        <span className="line-clamp-4 font-extrabold leading-[1.1] tracking-tight [overflow-wrap:anywhere]" style={{ fontSize: "clamp(7px, 10.5cqw, 30px)" }}>{book.title}</span>
        <span className="line-clamp-2 font-serif italic opacity-85 [overflow-wrap:anywhere]" style={{ fontSize: "clamp(6px, 7cqw, 18px)" }}>{book.author}</span>
      </div>
    </div>
  );
}
