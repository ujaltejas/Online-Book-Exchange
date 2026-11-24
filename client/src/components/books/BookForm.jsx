import { useEffect, useRef, useState } from "react";
import { LuImagePlus, LuX } from "react-icons/lu";
import { ChoiceGroup, Field } from "../ui/Form";
import { Spinner } from "../ui/Feedback";
import { toFormData } from "../../lib/api";
import { CAMPUS_SUGGESTIONS, CATEGORIES, CONDITIONS, EXCHANGE_TYPES, MAX_IMAGES, MAX_IMAGE_MB } from "../../lib/constants";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const blank = { title: "", author: "", category: "", condition: "Good", exchangeType: "exchange", university: "", college: "", description: "" };

const LIMITS = {
  title: [2, 150, "Title"],
  author: [2, 120, "Author"],
  university: [2, 120, "University"],
  college: [2, 120, "College"],
  description: [10, 2000, "Description"],
};

const validate = (v) => {
  const errors = {};
  for (const [key, [min, max, label]] of Object.entries(LIMITS)) {
    const len = v[key].trim().length;
    if (len < min) errors[key] = `${label} must be at least ${min} characters.`;
    else if (len > max) errors[key] = `${label} must be ${max} characters or fewer.`;
  }
  if (!v.category) errors.category = "Choose a category.";
  return errors;
};

/** Used for both "list a book" and "edit listing". `book` is only passed when editing. */
export default function BookForm({ book, submitting, submitLabel, onSubmit }) {
  const [values, setValues] = useState(() =>
    book
      ? { title: book.title, author: book.author, category: book.category, condition: book.condition, exchangeType: book.exchangeType, university: book.university, college: book.college, description: book.description }
      : blank
  );
  const [errors, setErrors] = useState({});
  const [existing, setExisting] = useState(book?.images || []);
  const [removed, setRemoved] = useState([]);
  const [fresh, setFresh] = useState([]); // [{ file, url }]
  const [photoError, setPhotoError] = useState("");
  const freshRef = useRef(fresh);

  useEffect(() => {
    freshRef.current = fresh;
  });
  useEffect(() => () => freshRef.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };
  const total = existing.length + fresh.length;

  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    setPhotoError("");
    const accepted = [];
    for (const file of picked) {
      if (!ALLOWED.includes(file.type)) return setPhotoError("Only JPG, PNG or WebP photos are allowed.");
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setPhotoError(`"${file.name}" is larger than ${MAX_IMAGE_MB} MB.`);
      accepted.push({ file, url: URL.createObjectURL(file) });
    }
    if (total + accepted.length > MAX_IMAGES) {
      accepted.forEach((a) => URL.revokeObjectURL(a.url));
      return setPhotoError(`You can add up to ${MAX_IMAGES} photos.`);
    }
    setFresh((f) => [...f, ...accepted]);
  };

  const removeFresh = (url) => {
    URL.revokeObjectURL(url);
    setFresh((f) => f.filter((x) => x.url !== url));
  };
  const removeExisting = (img) => {
    setExisting((l) => l.filter((x) => x._id !== img._id));
    setRemoved((r) => [...r, img._id]);
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    const fields = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
    if (book) fields.removedImages = JSON.stringify(removed);
    onSubmit(toFormData(fields, { images: fresh.map((f) => f.file) }));
  };

  const section = "rounded-lg border border-line bg-white p-6 sm:p-8";
  const heading = "text-xl font-bold";

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <section className={section}>
        <h2 className={heading}>The book</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Title" htmlFor="title" error={errors.title} className="sm:col-span-2">
            <input id="title" className="input" value={values.title} onChange={set("title")} aria-invalid={!!errors.title} placeholder="Engineering Mathematics, Vol. 2" />
          </Field>
          <Field label="Author" htmlFor="author" error={errors.author}>
            <input id="author" className="input" value={values.author} onChange={set("author")} aria-invalid={!!errors.author} />
          </Field>
          <Field label="Category" htmlFor="category" error={errors.category}>
            <select id="category" className="input" value={values.category} onChange={set("category")} aria-invalid={!!errors.category}>
              <option value="">Choose a category</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <ChoiceGroup legend="Condition" name="condition" value={values.condition} options={CONDITIONS.map((c) => ({ value: c, label: c }))} onChange={(v) => setValues((s) => ({ ...s, condition: v }))} />
          <ChoiceGroup legend="You would like to" name="exchangeType" value={values.exchangeType} options={EXCHANGE_TYPES.map((t) => ({ value: t.value, label: t.value === "free" ? "Give it away" : "Swap it" }))} onChange={(v) => setValues((s) => ({ ...s, exchangeType: v }))} />
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>Where it can be collected</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="University" htmlFor="university" error={errors.university}>
            <input id="university" list="campus-list" className="input" value={values.university} onChange={set("university")} aria-invalid={!!errors.university} />
            <datalist id="campus-list">{CAMPUS_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="College or department" htmlFor="college" error={errors.college}>
            <input id="college" className="input" value={values.college} onChange={set("college")} aria-invalid={!!errors.college} />
          </Field>
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>Description</h2>
        <Field htmlFor="description" error={errors.description} hint={`${values.description.length}/2000. Mention the edition, any highlighting, and what you would like in return.`} className="mt-6">
          <textarea id="description" className="input min-h-36 resize-y font-serif" value={values.description} onChange={set("description")} aria-invalid={!!errors.description} maxLength={2000} />
        </Field>
      </section>

      <section className={section}>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className={heading}>Photos</h2>
          <span className="text-sm text-ink-soft">{total} / {MAX_IMAGES}</span>
        </div>
        <p className="hint">Optional but listings with photos get more messages. JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB each.</p>
        <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {existing.map((img) => (
            <li key={img._id} className="relative aspect-square overflow-hidden rounded-md border border-line">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => removeExisting(img)} aria-label="Remove photo" className="absolute right-1.5 top-1.5 rounded-full bg-ink/80 p-1 text-white hover:bg-danger"><LuX className="h-4 w-4" /></button>
            </li>
          ))}
          {fresh.map((f) => (
            <li key={f.url} className="relative aspect-square overflow-hidden rounded-md border border-line">
              <img src={f.url} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => removeFresh(f.url)} aria-label="Remove photo" className="absolute right-1.5 top-1.5 rounded-full bg-ink/80 p-1 text-white hover:bg-danger"><LuX className="h-4 w-4" /></button>
            </li>
          ))}
          {total < MAX_IMAGES && (
            <li>
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-line text-sm font-medium text-ink-soft hover:border-lamp hover:text-lamp has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brass">
                <LuImagePlus className="h-6 w-6" aria-hidden="true" />
                Add photos
                <input type="file" accept={ALLOWED.join(",")} multiple className="sr-only" onChange={addFiles} />
              </label>
            </li>
          )}
        </ul>
        {photoError && <p className="field-error" role="alert">{photoError}</p>}
      </section>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary px-6 py-3 text-base" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />} {submitLabel}
        </button>
      </div>
    </form>
  );
}
