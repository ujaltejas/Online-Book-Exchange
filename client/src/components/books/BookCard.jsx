import { Link } from "react-router-dom";
import { LuMapPin } from "react-icons/lu";
import BookCover from "./BookCover";
import { StatusBadge, TypeBadge } from "../ui/Badges";
import { categoryStyle } from "../../lib/constants";

export default function BookCard({ book }) {
  const { bg } = categoryStyle(book.category);
  const faded = book.status === "exchanged";
  return (
    <Link
      to={`/books/${book._id}`}
      className={`group flex overflow-hidden rounded-md border border-line bg-white transition-colors hover:border-ink ${faded ? "opacity-70" : ""}`}
    >
      <span className="w-2 shrink-0" style={{ background: bg }} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="aspect-[4/3] overflow-hidden">
          <BookCover book={book} />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="text-[13px] font-semibold" style={{ color: bg }}>{book.category}</p>
          <h3 className="mt-0.5 line-clamp-2 text-[17px] font-bold leading-snug decoration-brass decoration-2 underline-offset-4 group-hover:underline">
            {book.title}
          </h3>
          <p className="mt-1 line-clamp-1 font-serif text-[15px] italic text-ink-soft">{book.author}</p>
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-soft">
            <LuMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{book.university}</span>
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
            <TypeBadge type={book.exchangeType} />
            <span className="text-[13px] font-medium text-ink-soft">{book.condition} condition</span>
            {book.status !== "available" && <StatusBadge status={book.status} />}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-md border border-line bg-white" aria-hidden="true">
      <span className="w-2 bg-lamp-tint" />
      <div className="flex-1">
        <div className="aspect-[4/3] animate-pulse bg-lamp-tint" />
        <div className="space-y-2.5 p-4">
          <div className="h-3 w-16 animate-pulse rounded bg-lamp-tint" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-lamp-tint" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-lamp-tint" />
        </div>
      </div>
    </div>
  );
}
