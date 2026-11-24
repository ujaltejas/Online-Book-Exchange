import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuBookOpen, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import BookCover from "../components/books/BookCover";
import Avatar from "../components/ui/Avatar";
import ConfirmDialog from "../components/ui/Dialog";
import { Field } from "../components/ui/Form";
import { EmptyState, ErrorState, Skeleton, Spinner } from "../components/ui/Feedback";
import { booksApi, getErrorMessage, toFormData } from "../lib/api";
import { MAX_IMAGE_MB, STATUSES } from "../lib/constants";
import { formatDate } from "../lib/format";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { useFetch } from "../hooks/useFetch";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function Listings() {
  const { data, loading, error, reload, setData } = useFetch(() => booksApi.mine(), []);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const changeStatus = async (book, status) => {
    try {
      const updated = await booksApi.setStatus(book._id, status);
      setData((d) => ({ ...d, books: d.books.map((b) => (b._id === updated._id ? updated : b)) }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await booksApi.remove(toDelete._id);
      setData((d) => ({ ...d, books: d.books.filter((b) => b._id !== toDelete._id) }));
      toast.success("Listing deleted.");
      setToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading) return <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>;
  if (!data.books.length) {
    return (
      <EmptyState icon={LuBookOpen} title="You have not listed any books" action={<Link to="/add-book" className="btn btn-primary"><LuPlus aria-hidden="true" /> List your first book</Link>}>
        Got a textbook you have finished with? Someone on your campus probably needs it.
      </EmptyState>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-ink-soft">
        {data.books.length}{data.limit ? ` of ${data.limit}` : ""} listings
      </p>
      <ul className="space-y-3">
        {data.books.map((b) => (
          <li key={b._id} className="flex flex-col gap-4 rounded-md border border-line bg-white p-4 sm:flex-row sm:items-center">
            <Link to={`/books/${b._id}`} className="block aspect-[4/3] w-full shrink-0 overflow-hidden rounded sm:w-32" aria-hidden="true" tabIndex={-1}>
              <BookCover book={b} />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/books/${b._id}`} className="line-clamp-1 text-lg font-bold hover:underline">{b.title}</Link>
              <p className="font-serif text-[15px] italic text-ink-soft">{b.author}</p>
              <p className="mt-1 text-[13px] text-ink-soft">{b.category}, listed {formatDate(b.createdAt)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`st-${b._id}`}>Status of {b.title}</label>
              <select id={`st-${b._id}`} className="input w-auto py-1.5 text-sm" value={b.status} onChange={(e) => changeStatus(b, e.target.value)}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <Link to={`/books/${b._id}/edit`} className="btn btn-ghost btn-sm" aria-label={`Edit ${b.title}`}><LuPencil aria-hidden="true" /> Edit</Link>
              <button className="btn btn-ghost btn-sm text-danger hover:border-danger" onClick={() => setToDelete(b)} aria-label={`Delete ${b.title}`}><LuTrash2 aria-hidden="true" /></button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog open={Boolean(toDelete)} title="Delete this listing?" confirmLabel="Delete listing" danger busy={busy} onConfirm={remove} onCancel={() => setToDelete(null)}>
        &ldquo;{toDelete?.title}&rdquo; and its photos will be removed for good.
      </ConfirmDialog>
    </>
  );
}

function Account() {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState({ username: user.username, email: user.email });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return setError("Use a JPG, PNG or WebP image.");
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`The image must be ${MAX_IMAGE_MB} MB or smaller.`);
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await updateProfile(toFormData({ username: form.username.trim(), email: form.email.trim() }, { image: file }));
      setFile(null);
      toast.success("Profile updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-lg space-y-5 rounded-lg border border-line bg-white p-6 sm:p-8">
      {error && <p role="alert" className="rounded-md bg-danger-tint px-4 py-3 text-sm font-medium text-danger">{error}</p>}
      <div className="flex items-center gap-4">
        {preview ? <img src={preview} alt="New profile photo preview" className="h-16 w-16 rounded-full object-cover" /> : <Avatar user={user} size="lg" />}
        <label className="btn btn-ghost btn-sm cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brass">
          Change photo
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} />
        </label>
      </div>
      <Field label="Name" htmlFor="acc-name"><input id="acc-name" className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
      <Field label="Email" htmlFor="acc-email" hint="Messages from interested students are sent to this address."><input id="acc-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <button className="btn btn-primary" disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Save changes</button>
    </form>
  );
}

export default function Profile() {
  useDocumentTitle("My listings");
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState("listings");
  const tabs = [["listings", "My listings"], ["account", "Account"]];

  return (
    <div className="page py-10">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Avatar user={user} size="xl" />
          <div>
            <h1 className="text-3xl font-extrabold">{user.username}</h1>
            <p className="text-[15px] text-ink-soft">{user.email}</p>
            <p className="text-[13px] text-ink-soft">Member since {formatDate(user.createdAt)}</p>
          </div>
        </div>
        <Link to="/add-book" className="btn btn-brass"><LuPlus aria-hidden="true" /> List a book</Link>
      </div>

      <div role="tablist" aria-label="Profile sections" className="mt-10 flex gap-6 border-b border-line">
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" id={`tab-${key}`} aria-selected={tab === key} aria-controls={`panel-${key}`} onClick={() => setTab(key)}
            className={`-mb-px border-b-[3px] pb-3 text-[15px] font-semibold ${tab === key ? "border-brass text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-8">
        {tab === "listings" ? <Listings /> : <Account />}
      </div>
    </div>
  );
}
