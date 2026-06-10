import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBookStore from "../store/useBookStore";
import useAuthStore from "../store/useAuthStore";
import { UNIVERSITY_SUGGESTIONS, COLLEGE_SUGGESTIONS } from "../lib/institutions";

const BOOK_LIMIT = 20;

function AddBook() {
  const navigate = useNavigate();
  const { createBook, getUserBooks, loading, error, clearError, userBooks } = useBookStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) getUserBooks();
  }, [user, getUserBooks]);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Engineering",
    condition: "Good",
    exchangeType: "exchange",
    description: "",
    images: [],
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  const currentCount = userBooks.length;
  const canAddMore = user?.role === "user" ? currentCount < BOOK_LIMIT : true;

  useEffect(() => {
    if (!canAddMore && user?.role === "user") {
      setFormError(`You can list up to ${BOOK_LIMIT} books.`);
    }
  }, [canAddMore, user?.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    clearError();

    if (
      !formData.title ||
      !formData.author ||
      !formData.description ||
      !formData.university?.trim() ||
      !formData.college?.trim()
    ) {
      setFormError("Please fill title, author, university, college, and description.");
      return;
    }

    try {
      await createBook(formData);
      setSuccess(true);
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      setFormError(err.message || "Failed to add book");
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    const newPreviews = [...imagePreview];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold text-slate-800">List a book</h1>
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          onClick={() => navigate("/profile")}
        >
          Back to profile
        </button>
      </div>

      {user?.role === "user" && (
        <div className="mb-6 rounded-lg bg-slate-100 px-4 py-3 text-center">
          <p className="text-slate-700">
            Your listings: {currentCount}/{BOOK_LIMIT}
          </p>
          {!canAddMore && (
            <p className="mt-1 font-medium text-red-500">You have reached the listing limit for your account.</p>
          )}
        </div>
      )}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-10 text-center">
          <h2 className="text-2xl font-semibold text-emerald-600">Book listed</h2>
          <p className="mt-2 text-slate-600">Redirecting to your profile…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {(formError || error) && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{formError || error}</div>
          )}

          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 border-b border-slate-200 pb-3 text-xl font-semibold text-slate-800">Campus</h2>
            <p className="mb-3 text-sm text-slate-500">
              Helps others find books from your university or college.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="university" className="mb-1.5 block text-sm font-medium text-slate-700">University *</label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  list="university-suggestions"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. Anna University"
                  required
                  className={inputClass}
                />
                <datalist id="university-suggestions">
                  {UNIVERSITY_SUGGESTIONS.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="college" className="mb-1.5 block text-sm font-medium text-slate-700">College / department *</label>
                <input
                  type="text"
                  id="college"
                  name="college"
                  list="college-suggestions"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. College of Engineering, Guindy"
                  required
                  className={inputClass}
                />
                <datalist id="college-suggestions">
                  {COLLEGE_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b border-slate-200 pb-3 text-xl font-semibold text-slate-800">Book details</h2>
            <div className="mb-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Book title"
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4">
              <div>
                <label htmlFor="author" className="mb-1.5 block text-sm font-medium text-slate-700">Author *</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Author name"
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-slate-700">Category *</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Law">Law</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="condition" className="mb-1.5 block text-sm font-medium text-slate-700">Condition *</label>
                <select id="condition" name="condition" value={formData.condition} onChange={handleChange} className={inputClass}>
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Used">Used</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <div>
                <label htmlFor="exchangeType" className="mb-1.5 block text-sm font-medium text-slate-700">Offering *</label>
                <select
                  id="exchangeType"
                  name="exchangeType"
                  value={formData.exchangeType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="exchange">Exchange</option>
                  <option value="free">Free / donate</option>
                </select>
              </div>
            </div>
            <div>
              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Edition, notes, what you want in exchange…"
                  rows="5"
                  required
                  className={`${inputClass} min-h-[100px] resize-y`}
                />
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 border-b border-slate-200 pb-3 text-xl font-semibold text-slate-800">Cover photo</h2>
            <p className="mb-3 text-sm text-slate-500">
              You can add images later by editing the listing.
            </p>
            <div>
              <div>
                <label htmlFor="images" className="mb-1.5 block text-sm font-medium text-slate-700">Upload images</label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                />
                <div
                  className="inline-flex cursor-pointer items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                  onClick={triggerFileInput}
                >
                  Choose files
                </div>
              </div>
            </div>
            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {imagePreview.map((src, index) => (
                  <div key={src} className="relative h-36 overflow-hidden rounded-lg">
                    <img src={src} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
              disabled={loading || !canAddMore}
            >
              {loading ? "Saving…" : "List book"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AddBook;
