import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <div className="page py-24">
      <p className="text-8xl font-extrabold leading-none text-brass" aria-hidden="true">404</p>
      <h1 className="mt-4 text-4xl font-extrabold">That page is not on the shelf</h1>
      <p className="reading mt-3 max-w-md text-ink-soft">The link may be old, or the listing may have been removed.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn btn-primary">Go home</Link>
        <Link to="/books" className="btn btn-ghost">Browse books</Link>
      </div>
    </div>
  );
}
