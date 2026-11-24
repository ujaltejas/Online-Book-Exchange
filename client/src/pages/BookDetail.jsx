import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft, LuBookX, LuMapPin, LuPencil, LuTrash2 } from "react-icons/lu";
import ImageGallery from "../components/books/ImageGallery";
import ContactForm from "../components/books/ContactForm";
import Avatar from "../components/ui/Avatar";
import ConfirmDialog from "../components/ui/Dialog";
import { StatusBadge, TypeBadge } from "../components/ui/Badges";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/Feedback";
import { booksApi, getErrorMessage } from "../lib/api";
import { STATUSES, categoryStyle } from "../lib/constants";
import { formatDate } from "../lib/format";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { useFetch } from "../hooks/useFetch";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function DetailSkeleton() {
  return (
    <div className="page grid gap-10 py-10 lg:grid-cols-2" aria-hidden="true">
      <Skeleton className="aspect-[4/3]" />
      <div className="space-y-4"><Skeleton className="h-6 w-24" /><Skeleton className="h-10 w-4/5" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-40" /></div>
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: book, loading, error, status, reload, setData } = useFetch(() => booksApi.get(id), [id]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useDocumentTitle(book?.title);

  if (loading && !book) return <DetailSkeleton />;
  if (status === 404) {
    return (
      <div className="page py-16">
        <EmptyState icon={LuBookX} title="This listing is gone" action={<Link to="/books" className="btn btn-primary">Browse books</Link>}>
          It may have been exchanged and removed by its owner.
        </EmptyState>
      </div>
    );
  }
  if (error) return <div className="page py-16"><ErrorState message={error} onRetry={reload} /></div>;

  const { bg } = categoryStyle(book.category);
  const isOwner = Boolean(user && book.owner && user._id === book.owner._id);
  const canManage = isOwner || user?.role === "admin";
  const ownerName = book.owner?.username || "a former member";

  const changeStatus = async (value) => {
    try {
      setData(await booksApi.setStatus(book._id, value));
      toast.success(`Marked as ${value}.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await booksApi.remove(book._id);
      toast.success("Listing deleted.");
      navigate(isOwner ? "/profile" : "/books", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  const rows = [
    ["Condition", book.condition],
    ["University", book.university],
    ["College", book.college],
    ["Listed", formatDate(book.createdAt)],
  ];

  return (
    <div className="page py-8">
      <Link to="/books" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <LuArrowLeft aria-hidden="true" /> All books
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <ImageGallery key={book._id} book={book} />
          <h2 className="mt-10 text-xl font-bold">About this book</h2>
          <p className="reading mt-3 whitespace-pre-line">{book.description}</p>
        </div>

        <aside className="self-start rounded-lg border border-line border-t-[6px] bg-white p-6 lg:sticky lg:top-24" style={{ borderTopColor: bg }}>
          <p className="text-sm font-semibold" style={{ color: bg }}>{book.category}</p>
          <h1 className="mt-1 text-[clamp(1.6rem,3vw,2.1rem)] font-extrabold leading-tight">{book.title}</h1>
          <p className="mt-1.5 font-serif text-lg italic text-ink-soft">{book.author}</p>
          <div className="mt-4 flex flex-wrap gap-2"><TypeBadge type={book.exchangeType} /><StatusBadge status={book.status} /></div>

          <dl className="mt-6 divide-y divide-line border-y border-line text-[15px]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-center gap-3">
            <Avatar user={book.owner} />
            <div>
              <p className="text-[13px] text-ink-soft">Listed by</p>
              <p className="font-bold">{ownerName}</p>
            </div>
          </div>
          <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft">
            <LuMapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>No payments through BookSwap. Message the owner and agree a safe place to meet on campus.</span>
          </p>

          <div className="mt-6 border-t border-line pt-6">
            {canManage ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="label">Status</label>
                  <select id="status" className="input" value={book.status} onChange={(e) => changeStatus(e.target.value)}>
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Link to={`/books/${book._id}/edit`} className="btn btn-ghost flex-1"><LuPencil aria-hidden="true" /> Edit</Link>
                  <button className="btn btn-ghost flex-1 text-danger hover:border-danger" onClick={() => setConfirmOpen(true)}><LuTrash2 aria-hidden="true" /> Delete</button>
                </div>
              </div>
            ) : !user ? (
              <div>
                <p className="text-[15px] text-ink-soft">Sign in to message {ownerName} about this book.</p>
                <Link to="/login" state={{ from: `/books/${book._id}` }} className="btn btn-primary mt-4 w-full">Sign in to contact</Link>
              </div>
            ) : book.status === "exchanged" ? (
              <p className="rounded-md bg-lamp-tint p-4 text-[15px]">This book has already found a new home.</p>
            ) : (
              <ContactForm book={book} />
            )}
          </div>
        </aside>
      </div>

      <ConfirmDialog open={confirmOpen} title="Delete this listing?" confirmLabel="Delete listing" danger busy={busy} onConfirm={remove} onCancel={() => setConfirmOpen(false)}>
        &ldquo;{book.title}&rdquo; and its photos will be removed for good.
      </ConfirmDialog>
    </div>
  );
}
