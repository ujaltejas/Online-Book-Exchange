import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LuLogOut, LuMenu, LuPlus, LuShieldCheck, LuX, LuLibrary } from "react-icons/lu";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "../../store/useToastStore";

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-[15px] font-medium transition-colors ${isActive ? "bg-lamp-tint text-lamp-deep" : "text-ink-soft hover:text-ink"}`;

function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium hover:bg-lamp-tint";
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-lamp-tint"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} size="sm" />
        <span className="max-w-28 truncate text-sm font-semibold">{user.username}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-xl">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-bold">{user.username}</p>
            <p className="truncate text-[13px] text-ink-soft">{user.email}</p>
          </div>
          <Link to="/profile" role="menuitem" className={item} onClick={() => setOpen(false)}>
            <LuLibrary aria-hidden="true" /> My listings
          </Link>
          {user.role === "admin" && (
            <Link to="/admin" role="menuitem" className={item} onClick={() => setOpen(false)}>
              <LuShieldCheck aria-hidden="true" /> Admin dashboard
            </Link>
          )}
          <button role="menuitem" className={`${item} text-danger`} onClick={onSignOut}>
            <LuLogOut aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setMobileOpen(false);

  const signOut = async () => {
    close();
    await logout();
    toast.success("You have been signed out.");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLink to="/books" className={linkClass}>Browse books</NavLink>
            <NavLink to="/about" className={linkClass}>How it works</NavLink>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/add-book" className="btn btn-brass btn-sm">
                <LuPlus aria-hidden="true" /> List a book
              </Link>
              <UserMenu user={user} onSignOut={signOut} />
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-quiet">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Join BookSwap</Link>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 hover:bg-lamp-tint md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <LuX className="h-6 w-6" /> : <LuMenu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-paper md:hidden">
          <nav className="page flex flex-col gap-1 py-4" aria-label="Mobile">
            <NavLink to="/books" className={linkClass} onClick={close}>Browse books</NavLink>
            <NavLink to="/about" className={linkClass} onClick={close}>How it works</NavLink>
            {user ? (
              <>
                <NavLink to="/add-book" className={linkClass} onClick={close}>List a book</NavLink>
                <NavLink to="/profile" className={linkClass} onClick={close}>My listings</NavLink>
                {user.role === "admin" && <NavLink to="/admin" className={linkClass} onClick={close}>Admin dashboard</NavLink>}
                <button className="rounded-md px-3 py-2 text-left text-[15px] font-medium text-danger hover:bg-danger-tint" onClick={signOut}>
                  Sign out ({user.username})
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link to="/login" className="btn btn-ghost flex-1" onClick={close}>Sign in</Link>
                <Link to="/register" className="btn btn-primary flex-1" onClick={close}>Join</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
