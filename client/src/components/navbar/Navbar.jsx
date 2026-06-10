import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

function Navbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const isActive = (path) => location.pathname === path;
  const profilePath = user?.role === "admin" ? "/profile/admin" : "/profile";

  const desktopLink = (path) =>
    `transition hover:text-violet-600 ${isActive(path) ? "text-violet-600 font-semibold" : "text-slate-700"}`;

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="BookSwap Logo" className="h-7 w-7" />
              <span className="text-lg font-bold text-slate-800">BookSwap</span>
            </Link>
            <div className="hidden items-center gap-5 md:flex">
              <Link to="/" className={desktopLink("/")}>
                Home
              </Link>
              <Link to="/list" className={desktopLink("/list")}>
                Browse books
              </Link>
              <Link to="/about" className={desktopLink("/about")}>
                About
              </Link>
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {!user ? (
              <>
                <Link to="/login" className={desktopLink("/login")}>
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <Link to={profilePath} className={desktopLink(profilePath)}>
                {user.role === "admin" ? "Admin Dashboard" : "Profile"}
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <span className="text-2xl leading-none">&times;</span> : <img src="/menu.svg" alt="" className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-72 bg-white p-6 shadow-xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-800">Menu</span>
          <button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-2xl leading-none hover:bg-slate-100">
            &times;
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/" onClick={() => setOpen(false)} className="rounded px-3 py-2 hover:bg-slate-100">
            Home
          </Link>
          <Link to="/list" onClick={() => setOpen(false)} className="rounded px-3 py-2 hover:bg-slate-100">
            Browse books
          </Link>
          <Link to="/about" onClick={() => setOpen(false)} className="rounded px-3 py-2 hover:bg-slate-100">
            About
          </Link>
          {user ? (
            <>
              <Link to={profilePath} onClick={() => setOpen(false)} className="rounded px-3 py-2 hover:bg-slate-100">
                {user.role === "admin" ? "Admin Dashboard" : "Profile"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="rounded px-3 py-2 text-left text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="rounded px-3 py-2 hover:bg-slate-100">
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="rounded bg-gradient-to-r from-violet-500 to-violet-600 px-3 py-2 text-center font-semibold text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;