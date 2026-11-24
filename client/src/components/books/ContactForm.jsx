import { useState } from "react";
import { LuCheck, LuSend } from "react-icons/lu";
import { Field } from "../ui/Form";
import { Spinner } from "../ui/Feedback";
import { booksApi, getErrorMessage } from "../../lib/api";
import { toast } from "../../store/useToastStore";

export default function ContactForm({ book }) {
  const [message, setMessage] = useState(`Hi! Is "${book.title}" still available? I would love to arrange a handover.`);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (message.trim().length < 10) return setError("Write a message of at least 10 characters.");
    setSending(true);
    try {
      const msg = await booksApi.contact(book._id, { message: message.trim(), phone: phone.trim() });
      setSentTo(msg);
      toast.success("Message sent.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (sentTo) {
    return (
      <div className="rounded-md bg-lamp-tint p-5">
        <p className="flex items-center gap-2 font-bold text-lamp-deep"><LuCheck aria-hidden="true" /> Message sent</p>
        <p className="mt-1.5 text-[15px] text-ink-soft">{sentTo}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label="Your message" htmlFor="contact-message" hint={`${message.length}/1000. The owner receives your name and email, and replies to you directly.`}>
        <textarea id="contact-message" className="input min-h-28 resize-y" value={message} maxLength={1000} onChange={(e) => setMessage(e.target.value)} />
      </Field>
      <Field label="Phone" htmlFor="contact-phone" optional error={error}>
        <input id="contact-phone" type="tel" className="input" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <button type="submit" className="btn btn-primary w-full" disabled={sending}>
        {sending ? <Spinner className="h-4 w-4" /> : <LuSend aria-hidden="true" />} Send message
      </button>
    </form>
  );
}
