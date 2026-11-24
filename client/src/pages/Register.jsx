import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "./auth/AuthShell";
import PasswordInput from "./auth/PasswordInput";
import Avatar from "../components/ui/Avatar";
import { Field } from "../components/ui/Form";
import { Spinner } from "../components/ui/Feedback";
import { getErrorMessage, toFormData } from "../lib/api";
import { MAX_IMAGE_MB } from "../lib/constants";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Register() {
  useDocumentTitle("Create an account");
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined, form: undefined }));
  };

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setErrors((er) => ({ ...er, avatar: "Use a JPG, PNG or WebP image." }));
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setErrors((er) => ({ ...er, avatar: `The image must be ${MAX_IMAGE_MB} MB or smaller.` }));
    setErrors((er) => ({ ...er, avatar: undefined }));
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.username.trim().length < 2) found.username = "Enter your name (at least 2 characters).";
    if (!EMAIL_RE.test(form.email.trim())) found.email = "Enter a valid email address.";
    if (form.password.length < 8) found.password = "Use at least 8 characters.";
    if (form.confirm !== form.password) found.confirm = "The passwords do not match.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await register(toFormData({ username: form.username.trim(), email: form.email.trim(), password: form.password }, { image: avatar }));
      toast.success("Welcome to BookSwap.");
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Join BookSwap" subtitle="Create a free account to list books and message owners." footer={<>Already a member? <Link to="/login" className="font-semibold text-lamp underline decoration-brass decoration-2 underline-offset-4">Sign in</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-5">
        {errors.form && <p role="alert" className="rounded-md bg-danger-tint px-4 py-3 text-sm font-medium text-danger">{errors.form}</p>}
        <div className="flex items-center gap-4">
          {preview ? <img src={preview} alt="Your profile photo preview" className="h-16 w-16 rounded-full object-cover" /> : <Avatar user={{ username: form.username }} size="lg" />}
          <div>
            <label className="btn btn-ghost btn-sm cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brass">
              {preview ? "Change photo" : "Add a photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pickAvatar} />
            </label>
            <p className={errors.avatar ? "field-error" : "hint"}>{errors.avatar || "Optional. We show your initials otherwise."}</p>
          </div>
        </div>
        <Field label="Name" htmlFor="username" error={errors.username}>
          <input id="username" autoComplete="name" className="input" value={form.username} onChange={set("username")} aria-invalid={!!errors.username} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters.">
          <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={set("password")} invalid={!!errors.password} />
        </Field>
        <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}>
          <PasswordInput id="confirm" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} invalid={!!errors.confirm} />
        </Field>
        <button className="btn btn-primary w-full py-3 text-base" disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Create account</button>
      </form>
    </AuthShell>
  );
}
