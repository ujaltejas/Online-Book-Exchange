import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useBookStore from "../store/useBookStore";
import useAuthStore from "../store/useAuthStore";
import BookDetailLayout from "../components/bookDetail/BookDetailLayout.jsx";
import { formatDateDDMMYYYY } from "../utils/dateFormat";

function BookView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookById, currentBook, loading, error, clearCurrentBook } = useBookStore();
  const { user } = useAuthStore();

  useEffect(() => {
    getBookById(id);
    return () => clearCurrentBook();
  }, [id, getBookById, clearCurrentBook]);

  useEffect(() => {
    if (loading || !currentBook || !user) return;
    const owner = currentBook.owner;
    if (!owner || String(user._id) !== String(owner._id)) {
      navigate("/profile", { replace: true });
    }
  }, [loading, currentBook, user, navigate]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center">
        <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-violet-600" />
        <p className="text-lg text-slate-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center px-5 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-red-500">Error</h2>
        <p className="mb-5 max-w-xl text-base text-slate-500">{error}</p>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5"
          onClick={() => navigate("/profile")}
        >
          Back to profile
        </button>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center px-5 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-red-500">Book not found</h2>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5"
          onClick={() => navigate("/profile")}
        >
          Back to profile
        </button>
      </div>
    );
  }

  const { owner, createdAt, updatedAt } = currentBook;

  if (!user || !owner || String(user._id) !== String(owner._id)) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center">
        <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-violet-600" />
        <p className="text-lg text-slate-500">Loading…</p>
      </div>
    );
  }

  const topBar = (
    <div className="mb-5 flex flex-wrap items-center gap-4">
      <button
        type="button"
        className="rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 text-[0.92rem] font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
        onClick={() => navigate("/profile")}
      >
        ← Back to profile
      </button>
      <span className="text-[1.05rem] font-bold text-slate-800">Your listing</span>
    </div>
  );

  const detailExtraCells = (
    <>
      <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
        <span className="mb-1.5 block text-xs font-medium text-slate-500">Listed</span>
        <span className="break-words text-sm font-semibold text-slate-800">{formatDateDDMMYYYY(createdAt)}</span>
      </div>
      <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
        <span className="mb-1.5 block text-xs font-medium text-slate-500">Last updated</span>
        <span className="break-words text-sm font-semibold text-slate-800">{formatDateDDMMYYYY(updatedAt)}</span>
      </div>
    </>
  );

  const sidebar = (
    <aside className="sticky top-[92px] order-2 flex flex-col gap-5 lg:order-none" aria-label="Your listing">
      <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-5 py-[18px] shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <img
          className="h-16 w-16 shrink-0 rounded-full border-[3px] border-violet-100 object-cover"
          src={owner.avatar || "/default-avatar.png"}
          alt=""
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
        <div className="min-w-0">
          <p className="mb-1 text-lg font-bold text-slate-800">{owner.username}</p>
          <p className="text-sm font-medium text-slate-500">Book owner</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-5 pb-6 pt-[22px] shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <div className="mb-4 flex items-center gap-3.5 border-b border-slate-200 pb-4">
          <img
            className="h-12 w-12 shrink-0 rounded-full border-2 border-violet-100 object-cover"
            src={owner.avatar || "/default-avatar.png"}
            alt=""
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <div>
            <h3 className="mb-1 text-[1.1rem] font-bold leading-5 text-slate-800">Your listing</h3>
            <p className="text-sm text-slate-500">Edit or return to profile</p>
          </div>
        </div>
        <p className="mb-4 text-sm leading-6 text-slate-500">
          This is how buyers see your book. Update details or photos anytime from edit.
        </p>
        <button
          type="button"
          className="mt-1 w-full rounded-[10px] bg-gradient-to-r from-violet-500 via-violet-600 to-violet-700 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5"
          onClick={() => navigate(`/edit-book/${id}`)}
        >
          Edit listing
        </button>
        <button
          type="button"
          className="mt-3 w-full rounded-[10px] border border-slate-200 bg-white px-5 py-3 text-[0.98rem] font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
          onClick={() => navigate("/profile")}
        >
          Back to profile
        </button>
      </div>
    </aside>
  );

  return (
    <BookDetailLayout
      book={currentBook}
      topBar={topBar}
      sidebar={sidebar}
      detailExtraCells={detailExtraCells}
      emptyImagesMessage="No cover image — add one by editing the listing."
    />
  );
}

export default BookView;
