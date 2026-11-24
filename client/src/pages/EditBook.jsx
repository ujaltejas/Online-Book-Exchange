import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import BookForm from "../components/books/BookForm";
import { ErrorState, Skeleton } from "../components/ui/Feedback";
import { booksApi, getErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { useFetch } from "../hooks/useFetch";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function EditBook() {
  useDocumentTitle("Edit listing");
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: book, loading, error, reload } = useFetch(() => booksApi.get(id), [id]);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="page max-w-3xl space-y-4 py-10"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-72" /></div>;
  if (error) return <div className="page py-16"><ErrorState message={error} onRetry={reload} /></div>;
  if (user._id !== book.owner?._id && user.role !== "admin") return <Navigate to={`/books/${id}`} replace />;

  const save = async (formData) => {
    setSubmitting(true);
    try {
      await booksApi.update(id, formData);
      toast.success("Changes saved.");
      navigate(`/books/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="page max-w-3xl py-10">
      <Link to={`/books/${id}`} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel and go back</Link>
      <h1 className="mt-3 text-4xl font-extrabold">Edit listing</h1>
      <div className="mt-8"><BookForm book={book} submitting={submitting} submitLabel="Save changes" onSubmit={save} /></div>
    </div>
  );
}
