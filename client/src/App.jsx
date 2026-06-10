import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./routes/homePage/homePage.jsx";
import ListPage from "./routes/listPage/listPage.jsx";
import SinglePage from "./routes/singlePage/SinglePage.jsx";
import Login from "./routes/login/login.jsx";
import Register from "./routes/register/register.jsx";
import About from "./routes/about/about.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

import { useEffect, useState } from "react";
import useAuthStore from "./store/useAuthStore.js";
import Profile from "./components/profile/Profile.jsx";
import Navbar from "./components/navbar/Navbar.jsx";
import AddBook from "./pages/AddBook.jsx";
import BookView from "./pages/BookView.jsx";
import EditBook from "./pages/EditBook.jsx";

const App = () => {
  const { checkAuth, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/add-book" element={user ? <AddBook /> : <Navigate to="/login" />} />
        <Route path="/edit-book/:id" element={user ? <EditBook /> : <Navigate to="/login" />} />
        <Route path="/my-book/:id" element={user ? <BookView /> : <Navigate to="/login" />} />

        <Route
          path="/profile/admin"
          element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />

        <Route path="/:id" element={<SinglePage />} />
      </Routes>
    </div>
  );
};

export default App;
