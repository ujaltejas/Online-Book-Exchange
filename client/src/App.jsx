import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { GuestOnly, RequireAdmin, RequireAuth } from "./components/routing/RouteGuards";
import { Spinner, Toaster } from "./components/ui/Feedback";
import { useAuthStore } from "./store/useAuthStore";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import BookDetail from "./pages/BookDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const Admin = lazy(() => import("./pages/Admin"));

const Loading = () => (
  <div className="grid min-h-[60vh] place-items-center text-lamp"><Spinner className="h-8 w-8" /></div>
);

// Old URLs from the previous version keep working.
const LegacyBook = ({ suffix = "" }) => {
  const { id } = useParams();
  return <Navigate to={`/books/${id}${suffix}`} replace />;
};

export default function App() {
  const ready = useAuthStore((s) => s.ready);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!ready) return <Loading />;

  return (
    <>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="books" element={<Browse />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="about" element={<About />} />

          <Route element={<RequireAuth />}>
            <Route path="profile" element={<Profile />} />
            <Route path="add-book" element={<AddBook />} />
            <Route path="books/:id/edit" element={<EditBook />} />
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="admin" element={<Suspense fallback={<Loading />}><Admin /></Suspense>} />
          </Route>

          <Route path="list" element={<Navigate to="/books" replace />} />
          <Route path="profile/admin" element={<Navigate to="/admin" replace />} />
          <Route path="my-book/:id" element={<LegacyBook />} />
          <Route path="edit-book/:id" element={<LegacyBook suffix="/edit" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
