import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function RequireAdmin() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestOnly() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (user) return <Navigate to={location.state?.from || "/"} replace />;
  return <Outlet />;
}
