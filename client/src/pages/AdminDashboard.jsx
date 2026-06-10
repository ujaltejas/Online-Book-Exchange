import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useBookStore from "../store/useBookStore";
import useAdminStore from "../store/useAdminStore";
import { generateReport, downloadReport } from "../utils/reportGenerator";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { getAllBooks, books, loading: bookLoading, deleteBook } = useBookStore();
  const { getAllUsers, deleteUser, users, loading: userLoading, error } = useAdminStore();
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [reportType, setReportType] = useState("overview");
  const [reportTimeframe, setReportTimeframe] = useState("all");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getAllUsers(), getAllBooks()]);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [getAllUsers, getAllBooks]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const filteredBooks = books.filter((b) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.university && b.university.toLowerCase().includes(q)) ||
      (b.college && b.college.toLowerCase().includes(q))
    );
  });

  const filterByTimeframe = (items) => {
    if (!items || !Array.isArray(items)) return [];
    if (reportTimeframe === "all") return items;
    const now = new Date();
    const timeframes = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      year: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    };
    return items.filter((item) => new Date(item.createdAt) >= timeframes[reportTimeframe]);
  };

  const filteredReportBooks = filterByTimeframe(books);
  const filteredReportUsers = filterByTimeframe(users);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Delete this user? Their listings remain unless removed separately.")) {
      try {
        await deleteUser(userId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Delete this book listing?")) return;
    try {
      await deleteBook(bookId);
      await getAllBooks();
    } catch (err) {
      setLocalError("Failed to delete book");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadReport = () => {
    const reportData = generateReport({ books, users }, reportType, reportTimeframe);
    downloadReport(reportData);
  };

  const bookCountForUser = (uid) =>
    books.filter((b) => {
      const o = b.owner;
      const oid = o && typeof o === "object" ? o._id : o;
      return String(oid) === String(uid);
    }).length;

  const inputClass =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

  if (userLoading || bookLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
        <p className="text-slate-600">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8 md:px-6">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClass}
          />
          {activeTab === "users" && (
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className={inputClass}>
              <option value="all">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === "users" ? "bg-violet-100 text-violet-700" : "text-slate-600 hover:bg-slate-100"}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === "books" ? "bg-violet-100 text-violet-700" : "text-slate-600 hover:bg-slate-100"}`}
          onClick={() => setActiveTab("books")}
        >
          Books
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === "reports" ? "bg-violet-100 text-violet-700" : "text-slate-600 hover:bg-slate-100"}`}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
      </div>

      {(error || localError) && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error || localError}</div>
      )}

      <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">
        {activeTab === "users" ? (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-800">Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Avatar</th>
                    <th className="px-3 py-2">Username</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Listings</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b border-slate-100">
                      <td className="px-3 py-2">
                        <img
                          src={u.avatar || "/default-avatar.png"}
                          alt={u.username}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">{u.username}</td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${u.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-2">{bookCountForUser(u._id)}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "books" ? (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-800">Book listings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Image</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Author</th>
                    <th className="px-3 py-2">University</th>
                    <th className="px-3 py-2">College</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Owner</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((b) => (
                    <tr key={b._id} className="border-b border-slate-100">
                      <td className="px-3 py-2">
                        <img
                          src={b.images?.[0]?.url || "/no-image.png"}
                          alt={b.title}
                          className="h-10 w-14 rounded object-cover"
                          onError={(e) => {
                            e.target.src = "/no-image.png";
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">{b.title}</td>
                      <td className="px-3 py-2">{b.author}</td>
                      <td className="px-3 py-2">{b.university || "—"}</td>
                      <td className="px-3 py-2">{b.college || "—"}</td>
                      <td className="px-3 py-2">{b.category}</td>
                      <td className="px-3 py-2">{b.owner?.username || "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${b.exchangeType === "free" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                          {b.exchangeType === "free" ? "Free" : "Exchange"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          onClick={() => handleDeleteBook(b._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-800">Reports</h2>
            <div className="mb-5 flex flex-wrap gap-2">
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className={inputClass}>
                <option value="overview">Overview</option>
                <option value="properties">Books analysis</option>
                <option value="users">User statistics</option>
              </select>
              <select value={reportTimeframe} onChange={(e) => setReportTimeframe(e.target.value)} className={inputClass}>
                <option value="all">All time</option>
                <option value="year">Year</option>
                <option value="month">Month</option>
                <option value="week">Week</option>
              </select>
              <button
                type="button"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                onClick={handleDownloadReport}
              >
                Download JSON
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-600">Books</h3>
                <div className="mt-1 text-3xl font-bold text-slate-800">{filteredReportBooks.length}</div>
                <div className="mt-2 text-sm text-slate-600">
                  <div>Exchange: {filteredReportBooks.filter((b) => b.exchangeType === "exchange").length}</div>
                  <div>Free: {filteredReportBooks.filter((b) => b.exchangeType === "free").length}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-600">Users</h3>
                <div className="mt-1 text-3xl font-bold text-slate-800">{filteredReportUsers.length}</div>
                <div className="mt-2 text-sm text-slate-600">
                  <div>Admins: {filteredReportUsers.filter((u) => u.role === "admin").length}</div>
                  <div>Students: {filteredReportUsers.filter((u) => u.role === "user").length}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-600">Condition</h3>
                <div className="mt-1 text-3xl font-bold text-slate-800">{filteredReportBooks.length}</div>
                <div className="mt-2 text-sm text-slate-600">
                  <div>New: {filteredReportBooks.filter((b) => b.condition === "New").length}</div>
                  <div>Good: {filteredReportBooks.filter((b) => b.condition === "Good").length}</div>
                  <div>Used: {filteredReportBooks.filter((b) => b.condition === "Used").length}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
