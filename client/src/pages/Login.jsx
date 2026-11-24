import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "./auth/AuthShell";
import PasswordInput from "./auth/PasswordInput";
import { Field } from "../components/ui/Form";
import { Spinner } from "../components/ui/Feedback";
import { getErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "../store/useToastStore";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Login() {
  useDocumentTitle("Sign in");
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) return setError("Enter your email and password.");
    setBusy(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      toast.success("Welcome back.");
      // GuestOnly redirects to the page you came from once the session is set.
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to message owners and manage your listings." footer={<>New to BookSwap? <Link to="/register" className="font-semibold text-lamp underline decoration-brass decoration-2 underline-offset-4">Create an account</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-5">
        {error && <p role="alert" className="rounded-md bg-danger-tint px-4 py-3 text-sm font-medium text-danger">{error}</p>}
        <Field label="Email" htmlFor="email">
          <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" htmlFor="password">
          <PasswordInput id="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <button className="btn btn-primary w-full py-3 text-base" disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Sign in</button>
      </form>
    </AuthShell>
  );
}
