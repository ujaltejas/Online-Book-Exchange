import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookForm from "../components/books/BookForm";
import { booksApi, getErrorMessage } from "../lib/api";
import { toast } from "../store/useToastStore";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function AddBook() {
  useDocumentTitle("List a book");
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const create = async (formData) => {
    setSubmitting(true);
    try {
      const book = await booksApi.create(formData);
      toast.success("Your book is listed.");
      navigate(`/books/${book._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="page max-w-3xl py-10">
      <h1 className="text-4xl font-extrabold">List a book</h1>
      <p className="reading mt-2 text-ink-soft">Tell students what you have. It takes about two minutes.</p>
      <div className="mt-8"><BookForm submitting={submitting} submitLabel="Publish listing" onSubmit={create} /></div>
    </div>
  );
}
