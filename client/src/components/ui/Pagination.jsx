import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const windowed = (page, total) => {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  list.forEach((p, i) => {
    if (i && p - list[i - 1] > 1) out.push("gap" + p);
    out.push(p);
  });
  return out;
};

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      <button className="btn btn-ghost btn-sm" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <LuChevronLeft aria-hidden="true" /> Prev
      </button>
      {windowed(page, totalPages).map((p) =>
        typeof p === "string" ? (
          <span key={p} className="px-1 text-ink-soft" aria-hidden="true">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`h-9 min-w-9 rounded-md px-2 text-sm font-semibold ${
              p === page ? "bg-lamp text-white" : "border border-line bg-white hover:border-ink"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button className="btn btn-ghost btn-sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        Next <LuChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}
