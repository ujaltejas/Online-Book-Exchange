import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useBookStore from "../../store/useBookStore";
import useAuthStore from "../../store/useAuthStore";
import { validateEmail } from "../../utils/validation";
import BookDetailLayout from "../../components/bookDetail/BookDetailLayout.jsx";

function SinglePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookById, currentBook, loading, error, clearCurrentBook, contactBookOwner } = useBookStore();
  const { user } = useAuthStore();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    getBookById(id);
    return () => clearCurrentBook();
  }, [id, getBookById, clearCurrentBook]);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(contactForm.email)) {
      alert("Please enter a valid email address");
      return;
    }
    try {
      await contactBookOwner(id, contactForm);
      setContactForm({ name: "", email: "", phone: "", message: "" });
      alert("Message sent. The owner can reply to your email.");
    } catch {
      alert("Could not send message. Try again or use details from your account if you know them.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center">
        <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-violet-600" />
        <p className="text-lg text-slate-500">Loading book…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center px-5 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-red-500">Error</h2>
        <p className="mb-5 max-w-xl text-base text-slate-500">{error}</p>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5"
          onClick={() => navigate("/list")}
        >
          Back to browse
        </button>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center px-5 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-red-500">Book not found</h2>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5"
          onClick={() => navigate("/list")}
        >
          Back to browse
        </button>
      </div>
    );
  }

  const { owner } = currentBook;
  const isOwner = user && owner && String(user._id) === String(owner._id);

  const sidebar = (
    <aside className="sticky top-[92px] order-2 flex flex-col gap-5 lg:order-none" aria-label="Owner and contact">
      <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-5 py-[18px] shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <img
          className="h-16 w-16 shrink-0 rounded-full border-[3px] border-violet-100 object-cover"
          src={owner.avatar || "/default-avatar.png"}
          alt=""
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
        <div className="min-w-0">
          <p className="mb-1 text-lg font-bold text-slate-800">{owner.username}</p>
          <p className="text-sm font-medium text-slate-500">Book owner</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-5 pb-6 pt-[22px] shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        <div className="mb-4 flex items-center gap-3.5 border-b border-slate-200 pb-4">
          <img
            className="h-12 w-12 shrink-0 rounded-full border-2 border-violet-100 object-cover"
            src={owner.avatar || "/default-avatar.png"}
            alt=""
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <div>
            <h3 className="mb-1 text-[1.1rem] font-bold leading-5 text-slate-800">Interested in this book?</h3>
            <p className="text-sm text-slate-500">Message {owner.username}</p>
          </div>
        </div>

        {isOwner ? (
          <p className="text-[0.92rem] leading-6 text-slate-600">
            This is your listing. Buyers will reach out via this form.
          </p>
        ) : !user ? (
          <p className="text-[0.92rem] leading-6 text-slate-600">
            <Link to="/login" className="font-semibold text-violet-600 hover:underline">
              Sign in
            </Link>{" "}
            to contact the owner. We email them on your behalf — arrange the exchange offline.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm leading-6 text-slate-500">
              We email the owner on your behalf. No payment on this site — arrange exchange offline.
            </p>
            <form className="space-y-3.5" onSubmit={handleContactSubmit}>
              <div>
                <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold text-slate-800">
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold text-slate-800">
                  Your email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold text-slate-800">
                  Your phone
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  placeholder="Phone (optional)"
                  value={contactForm.phone}
                  onChange={handleContactChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold text-slate-800">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Your message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  rows={4}
                  className="min-h-[100px] w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <button
                type="submit"
                className="mt-1 w-full rounded-[10px] bg-gradient-to-r from-violet-500 via-violet-600 to-violet-700 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5"
              >
                Send message
              </button>
            </form>
          </>
        )}
      </div>
    </aside>
  );

  return <BookDetailLayout book={currentBook} sidebar={sidebar} />;
}

export default SinglePage;
