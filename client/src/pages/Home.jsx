import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuBookOpen, LuPlus, LuSearch } from "react-icons/lu";
import Shelf from "../components/books/Shelf";
import BookCard, { BookCardSkeleton } from "../components/books/BookCard";
import { EmptyState, ErrorState } from "../components/ui/Feedback";
import { booksApi } from "../lib/api";
import { CAMPUS_SUGGESTIONS } from "../lib/constants";
import { useFetch } from "../hooks/useFetch";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const STEPS = [
  { n: "1", title: "List what you have finished with", body: "Add the title, condition and a few photos. Say whether you want to swap it or give it away." },
  { n: "2", title: "Get a message by email", body: "Interested students write to you through BookSwap. You see their name and email, and reply directly." },
  { n: "3", title: "Hand it over on campus", body: "Agree a time and place that suits you both, then mark the book as exchanged." },
];

export default function Home() {
  useDocumentTitle();
  const navigate = useNavigate();
  const [campus, setCampus] = useState("");
  const { data, loading, error, reload } = useFetch(() => booksApi.list({ limit: 4, status: "available" }), []);

  const findCampus = (e) => {
    e.preventDefault();
    navigate(campus.trim() ? `/books?university=${encodeURIComponent(campus.trim())}` : "/books");
  };

  return (
    <>
      <section className="page grid items-center gap-14 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <h1 className="text-[clamp(2.6rem,6.2vw,4.6rem)] font-extrabold leading-[0.98]">
            Pass your textbooks on to the{" "}
            <span className="bg-[linear-gradient(transparent_64%,var(--color-brass)_64%)]">next student.</span>
          </h1>
          <p className="reading mt-6 max-w-xl text-lg text-ink-soft">
            BookSwap puts students who have finished a book in touch with students who need it. Swap or give away, with no payments and no middlemen.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/books" className="btn btn-primary px-6 py-3 text-base"><LuBookOpen aria-hidden="true" /> Browse books</Link>
            <Link to="/add-book" className="btn btn-ghost px-6 py-3 text-base"><LuPlus aria-hidden="true" /> List a book</Link>
          </div>
        </div>
        <div>
          <Shelf />
          <p className="mt-6 text-center text-sm text-ink-soft">Pull a book off the shelf to browse that category.</p>
        </div>
      </section>

      <section className="page pb-20" aria-labelledby="recent-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="recent-heading" className="text-3xl font-extrabold">Just listed</h2>
          <Link to="/books" className="text-[15px] font-semibold text-lamp underline decoration-brass decoration-2 underline-offset-4 hover:text-lamp-deep">See all books</Link>
        </div>
        <div className="mt-8">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <BookCardSkeleton key={i} />)}</div>
          ) : data.books.length === 0 ? (
            <EmptyState icon={LuBookOpen} title="The shelf is empty" action={<Link to="/add-book" className="btn btn-primary">List the first book</Link>}>
              Nobody has listed a book yet. Yours could be the first.
            </EmptyState>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{data.books.map((b) => <BookCard key={b._id} book={b} />)}</div>
          )}
        </div>
      </section>

      <section className="bg-lamp py-20 text-white" aria-labelledby="how-heading">
        <div className="page">
          <h2 id="how-heading" className="max-w-xl text-3xl font-extrabold sm:text-4xl">Three steps, no money involved</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="text-6xl font-extrabold leading-none text-brass" aria-hidden="true">{s.n}</span>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="reading mt-2 text-[15.5px] text-white/80">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page grid gap-8 pb-6 pt-20 md:grid-cols-2 md:items-center" aria-labelledby="campus-heading">
        <h2 id="campus-heading" className="text-3xl font-extrabold sm:text-4xl">Looking for a book from your own campus?</h2>
        <div>
          <form onSubmit={findCampus} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="campus" className="sr-only">University or college</label>
            <input id="campus" list="home-campus" className="input flex-1 py-3" placeholder="Your university or college" value={campus} onChange={(e) => setCampus(e.target.value)} />
            <datalist id="home-campus">{CAMPUS_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
            <button className="btn btn-primary px-6 py-3"><LuSearch aria-hidden="true" /> Find books</button>
          </form>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CAMPUS_SUGGESTIONS.slice(0, 4).map((c) => (
              <li key={c}>
                <Link to={`/books?university=${encodeURIComponent(c)}`} className="inline-block rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium hover:border-ink">{c}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
