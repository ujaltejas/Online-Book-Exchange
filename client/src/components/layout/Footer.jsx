import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import { useAuthStore } from "../../store/useAuthStore";

export default function Footer() {
  const user = useAuthStore((s) => s.user);
  return (
    <footer className="mt-16 bg-lamp-deep text-white">
      <div className="page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm font-serif text-[15px] leading-relaxed text-white/75">
            Students passing academic books to the next student. BookSwap never handles money or meets you for you: you agree the handover yourselves.
          </p>
        </div>
        <nav aria-label="Explore" className="flex flex-col gap-2 text-[15px]">
          <span className="mb-1 text-sm font-semibold text-brass">Explore</span>
          <Link to="/books" className="text-white/80 hover:text-white">Browse books</Link>
          <Link to="/add-book" className="text-white/80 hover:text-white">List a book</Link>
          <Link to="/about" className="text-white/80 hover:text-white">How it works</Link>
        </nav>
        <nav aria-label="Account" className="flex flex-col gap-2 text-[15px]">
          <span className="mb-1 text-sm font-semibold text-brass">Account</span>
          {user ? (
            <Link to="/profile" className="text-white/80 hover:text-white">My listings and account</Link>
          ) : (
            <>
              <Link to="/login" className="text-white/80 hover:text-white">Sign in</Link>
              <Link to="/register" className="text-white/80 hover:text-white">Create an account</Link>
            </>
          )}
        </nav>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[13px] text-white/60">
        {new Date().getFullYear()} BookSwap. Built for students.
      </div>
    </footer>
  );
}
