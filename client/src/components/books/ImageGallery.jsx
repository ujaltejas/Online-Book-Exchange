import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import BookCover from "./BookCover";

export default function ImageGallery({ book }) {
  const images = book.images || [];
  const [index, setIndex] = useState(0);
  const current = Math.min(index, Math.max(0, images.length - 1));
  const go = (d) => setIndex((current + d + images.length) % images.length);
  const nav = "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow hover:bg-white";

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-white">
        {images.length ? (
          <img src={images[current].url} alt={`${book.title}, photo ${current + 1} of ${images.length}`} className="h-full w-full object-contain" />
        ) : (
          <BookCover book={book} />
        )}
        {images.length > 1 && (
          <>
            <button className={`${nav} left-3`} onClick={() => go(-1)} aria-label="Previous photo"><LuChevronLeft className="h-5 w-5" /></button>
            <button className={`${nav} right-3`} onClick={() => go(1)} aria-label="Next photo"><LuChevronRight className="h-5 w-5" /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-2.5 py-1 text-xs font-semibold text-white">
              {current + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <li key={img._id}>
              <button
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === current}
                className={`h-16 w-16 overflow-hidden rounded-md border-2 ${i === current ? "border-lamp" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
