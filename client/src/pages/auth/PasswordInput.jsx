import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function PasswordInput({ id, value, onChange, invalid, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} className="input pr-11" value={value} onChange={onChange} aria-invalid={invalid} autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-ink-soft hover:text-ink">
        {show ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
      </button>
    </div>
  );
}
