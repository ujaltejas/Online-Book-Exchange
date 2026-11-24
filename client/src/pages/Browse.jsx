import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LuBookOpen, LuSlidersHorizontal } from "react-icons/lu";
import BookCard, { BookCardSkeleton } from "../components/books/BookCard";
import FilterPanel from "../components/books/FilterPanel";
import Pagination from "../components/ui/Pagination";
import { EmptyState, ErrorState } from "../components/ui/Feedback";
import { booksApi } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { useFetch } from "../hooks/useFetch";
import { useDebounce } from "../hooks/useDebounce";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const TEXT_KEYS = ["q", "university", "college"];
const CHOICE_KEYS = ["category", "condition", "exchangeType", "status"];
const PAGE_SIZE = 12;

export default function Browse() {
  useDocumentTitle("Browse books");
  const userId = useAuthStore((s) => s.user?._id);
  const [params, setParams] = useSearchParams();
  const get = (k) => params.get(k) || "";

  // Text boxes keep their own state so typing is instant; the URL is updated after a short pause.
  const [text, setText] = useState(() => Object.fromEntries(TEXT_KEYS.map((k) => [k, get(k)])));
  const debounced = useDebounce(text, 400);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        let changed = false;
        TEXT_KEYS.forEach((k) => {
          const v = debounced[k].trim();
          if ((next.get(k) || "") !== v) {
            if (v) next.set(k, v);
            else next.delete(k);
            changed = true;
          }
        });
        if (changed) next.delete("page");
        return changed ? next : prev;
      },
      { replace: true }
    );
  }, [debounced, setParams]);

  const setFilter = (key, value) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      return next;
    });

  const filters = Object.fromEntries(CHOICE_KEYS.map((k) => [k, get(k)]));
  const page = Math.max(1, Number(get("page")) || 1);
  const sort = get("sort") || "newest";
  const activeCount = [...TEXT_KEYS, ...CHOICE_KEYS].filter((k) => get(k)).length;

  const { data, loading, error, reload } = useFetch(
    () => {
      const query = { page, limit: PAGE_SIZE, sort };
      [...TEXT_KEYS, ...CHOICE_KEYS].forEach((k) => get(k) && (query[k] = get(k)));
      if (userId) query.excludeOwner = userId;
      return booksApi.list(query);
    },
    [params.toString(), userId]
  );

  const clearAll = () => {
    setText({ q: "", university: "", college: "" });
    setParams({}, { replace: true });
  };
  const goToPage = (p) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(p));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold">Browse books</h1>
          <p className="mt-1.5 text-[15px] text-ink-soft" aria-live="polite">
            {data ? `${data.total} ${data.total === 1 ? "book" : "books"} found` : "Searching the shelves..."}
            {userId && " (your own listings are hidden here)"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost lg:hidden" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen} aria-controls="filters">
            <LuSlidersHorizontal aria-hidden="true" /> Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-ink-soft">Sort</label>
            <select id="sort" className="input w-auto py-2" value={sort} onChange={(e) => setFilter("sort", e.target.value === "newest" ? "" : e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A to Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside id="filters" className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <div className="rounded-lg border border-line bg-white p-5 lg:sticky lg:top-24">
            <FilterPanel
              text={text}
              onText={(k, v) => setText((t) => ({ ...t, [k]: v }))}
              filters={filters}
              onFilter={setFilter}
              onClear={clearAll}
              hasFilters={activeCount > 0}
            />
          </div>
        </aside>

        <section aria-label="Results">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading && !data ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <BookCardSkeleton key={i} />)}</div>
          ) : data.books.length === 0 ? (
            <EmptyState
              icon={LuBookOpen}
              title="No books match these filters"
              action={activeCount ? <button className="btn btn-primary" onClick={clearAll}>Clear all filters</button> : <Link to="/add-book" className="btn btn-primary">List a book</Link>}
            >
              Try a broader search, or check back soon. New books are listed every day.
            </EmptyState>
          ) : (
            <div className={loading ? "opacity-60 transition-opacity" : ""}>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data.books.map((b) => <BookCard key={b._id} book={b} />)}</div>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={goToPage} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
