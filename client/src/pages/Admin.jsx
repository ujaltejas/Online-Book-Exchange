import { useState } from "react";
import { Link } from "react-router-dom";
import { LuDownload, LuTrash2 } from "react-icons/lu";
import Avatar from "../components/ui/Avatar";
import ConfirmDialog from "../components/ui/Dialog";
import Pagination from "../components/ui/Pagination";
import { StatusBadge } from "../components/ui/Badges";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/Feedback";
import { adminApi, booksApi, getErrorMessage } from "../lib/api";
import { formatDate } from "../lib/format";
import { categoryStyle, statusLabel, typeLabel } from "../lib/constants";
import { toast } from "../store/useToastStore";
import { useFetch } from "../hooks/useFetch";
import { useDebounce } from "../hooks/useDebounce";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const TIMEFRAMES = [["all", "All time"], ["year", "Last year"], ["month", "Last 30 days"], ["week", "Last 7 days"]];

function BarList({ title, items, format = (x) => x, color }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <section className="rounded-lg border border-line bg-white p-5">
      <h3 className="font-bold">{title}</h3>
      {items.length === 0 ? <p className="mt-3 text-sm text-ink-soft">No data yet.</p> : (
        <ul className="mt-4 space-y-3">
          {items.map((i) => (
            <li key={i.label}>
              <div className="flex justify-between text-sm"><span>{format(i.label)}</span><span className="font-semibold">{i.count}</span></div>
              <div className="mt-1 h-2 rounded-full bg-lamp-tint"><div className="h-2 rounded-full bg-lamp" style={{ width: `${(i.count / max) * 100}%`, ...(color ? { background: color(i.label) } : {}) }} /></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Overview() {
  const [tf, setTf] = useState("all");
  const { data, loading, error, reload } = useFetch(() => adminApi.report(tf), [tf]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookswap-report-${tf}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="tf" className="text-sm font-medium text-ink-soft">Period</label>
          <select id="tf" className="input w-auto py-2" value={tf} onChange={(e) => setTf(e.target.value)}>
            {TIMEFRAMES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <button className="btn btn-ghost" onClick={download} disabled={!data}><LuDownload aria-hidden="true" /> Download report</button>
      </div>

      {error ? <div className="mt-6"><ErrorState message={error} onRetry={reload} /></div> : loading || !data ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[["Members", data.totals.users], ["Books listed", data.totals.books], ["Messages sent", data.totals.contactRequests], ["Admins", data.totals.admins]].map(([label, n]) => (
              <div key={label} className="rounded-lg border border-line bg-white p-5">
                <dt className="text-sm text-ink-soft">{label}</dt>
                <dd className="mt-1 text-4xl font-extrabold">{n}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BarList title="By category" items={data.byCategory} color={(l) => categoryStyle(l).bg} />
            <BarList title="By condition" items={data.byCondition} />
            <BarList title="By listing type" items={data.byType} format={typeLabel} />
            <BarList title="By status" items={data.byStatus} format={statusLabel} />
            <BarList title="Top universities" items={data.topUniversities} />
          </div>
        </>
      )}
    </div>
  );
}

const th = "px-4 py-3 text-left text-[13px] font-semibold text-ink-soft";
const td = "px-4 py-3 align-middle";

function Users() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const { data, loading, error, reload } = useFetch(() => adminApi.users({ q: dq, page }), [dq, page]);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      const r = await adminApi.deleteUser(target._id);
      toast.success(`${target.username} was deleted along with ${r.deletedBooks} listing(s).`);
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label htmlFor="uq" className="sr-only">Search members</label>
      <input id="uq" type="search" className="input max-w-sm" placeholder="Search by name or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      <div className="mt-4">
        {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-64" /> : data.users.length === 0 ? <EmptyState title="No members found" /> : (
          <>
            <div className="overflow-x-auto rounded-lg border border-line bg-white">
              <table className="w-full min-w-[640px] text-[15px]">
                <thead className="border-b border-line bg-paper"><tr><th className={th}>Member</th><th className={th}>Email</th><th className={th}>Role</th><th className={th}>Books</th><th className={th}>Joined</th><th className={th}><span className="sr-only">Actions</span></th></tr></thead>
                <tbody className="divide-y divide-line">
                  {data.users.map((u) => (
                    <tr key={u._id}>
                      <td className={td}><div className="flex items-center gap-3"><Avatar user={u} size="sm" /><span className="font-semibold">{u.username}</span></div></td>
                      <td className={`${td} text-ink-soft`}>{u.email}</td>
                      <td className={td}>{u.role}</td>
                      <td className={td}>{u.bookCount}</td>
                      <td className={`${td} text-ink-soft`}>{formatDate(u.createdAt)}</td>
                      <td className={`${td} text-right`}>
                        {u.role !== "admin" && <button className="btn btn-quiet btn-sm text-danger" onClick={() => setTarget(u)} aria-label={`Delete ${u.username}`}><LuTrash2 aria-hidden="true" /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </div>
      <ConfirmDialog open={Boolean(target)} title={`Delete ${target?.username}?`} confirmLabel="Delete member" danger busy={busy} onConfirm={remove} onCancel={() => setTarget(null)}>
        Their account and all of their listings (and photos) will be removed for good.
      </ConfirmDialog>
    </div>
  );
}

function Books() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const { data, loading, error, reload } = useFetch(() => booksApi.list({ q: dq, page, limit: 15 }), [dq, page]);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await booksApi.remove(target._id);
      toast.success("Listing deleted.");
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label htmlFor="bq" className="sr-only">Search books</label>
      <input id="bq" type="search" className="input max-w-sm" placeholder="Search title, author or campus" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      <div className="mt-4">
        {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <Skeleton className="h-64" /> : data.books.length === 0 ? <EmptyState title="No books found" /> : (
          <>
            <p className="mb-2 text-sm text-ink-soft">{data.total} books</p>
            <div className="overflow-x-auto rounded-lg border border-line bg-white">
              <table className="w-full min-w-[680px] text-[15px]">
                <thead className="border-b border-line bg-paper"><tr><th className={th}>Book</th><th className={th}>Owner</th><th className={th}>Status</th><th className={th}>Listed</th><th className={th}><span className="sr-only">Actions</span></th></tr></thead>
                <tbody className="divide-y divide-line">
                  {data.books.map((b) => (
                    <tr key={b._id}>
                      <td className={td}><Link to={`/books/${b._id}`} className="font-semibold hover:underline">{b.title}</Link><p className="font-serif text-sm italic text-ink-soft">{b.author}</p></td>
                      <td className={td}>{b.owner?.username || <span className="text-ink-soft">Deleted user</span>}</td>
                      <td className={td}><StatusBadge status={b.status} /></td>
                      <td className={`${td} text-ink-soft`}>{formatDate(b.createdAt)}</td>
                      <td className={`${td} text-right`}><button className="btn btn-quiet btn-sm text-danger" onClick={() => setTarget(b)} aria-label={`Delete ${b.title}`}><LuTrash2 aria-hidden="true" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </div>
      <ConfirmDialog open={Boolean(target)} title="Delete this listing?" confirmLabel="Delete listing" danger busy={busy} onConfirm={remove} onCancel={() => setTarget(null)}>
        &ldquo;{target?.title}&rdquo; and its photos will be removed for good.
      </ConfirmDialog>
    </div>
  );
}

export default function Admin() {
  useDocumentTitle("Admin dashboard");
  const [tab, setTab] = useState("overview");
  const tabs = [["overview", "Overview"], ["users", "Members"], ["books", "Books"]];
  const Panel = { overview: Overview, users: Users, books: Books }[tab];

  return (
    <div className="page py-10">
      <h1 className="text-4xl font-extrabold">Admin dashboard</h1>
      <div role="tablist" aria-label="Admin sections" className="mt-8 flex gap-6 border-b border-line">
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`-mb-px border-b-[3px] pb-3 text-[15px] font-semibold ${tab === key ? "border-brass text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-8"><Panel /></div>
    </div>
  );
}
