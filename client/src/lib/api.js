import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  timeout: 30_000,
});

export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === "ECONNABORTED") return "The request took too long. Please try again.";
  if (err?.request && !err.response) return "Cannot reach the server. Check your connection and try again.";
  return fallback;
};

/** Build multipart form data, skipping empty values. Arrays of files are appended under the same key. */
export const toFormData = (fields, files = {}) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  Object.entries(files).forEach(([k, list]) => (Array.isArray(list) ? list : [list]).forEach((f) => f && fd.append(k, f)));
  return fd;
};

export const authApi = {
  me: () => http.get("/auth/me").then((r) => r.data.user),
  login: (body) => http.post("/auth/login", body).then((r) => r.data.user),
  register: (fd) => http.post("/auth/register", fd).then((r) => r.data.user),
  logout: () => http.post("/auth/logout"),
  updateProfile: (fd) => http.put("/auth/profile", fd).then((r) => r.data.user),
};

export const booksApi = {
  list: (params) => http.get("/post", { params }).then((r) => r.data),
  get: (id) => http.get(`/post/${id}`).then((r) => r.data.book),
  mine: () => http.get("/post/mine").then((r) => r.data),
  create: (fd) => http.post("/post", fd).then((r) => r.data.book),
  update: (id, fd) => http.put(`/post/${id}`, fd).then((r) => r.data.book),
  setStatus: (id, status) => http.patch(`/post/${id}/status`, { status }).then((r) => r.data.book),
  remove: (id) => http.delete(`/post/${id}`),
  contact: (id, body) => http.post(`/post/${id}/contact`, body).then((r) => r.data.message),
};

export const adminApi = {
  users: (params) => http.get("/admin/users", { params }).then((r) => r.data),
  deleteUser: (id) => http.delete(`/admin/users/${id}`).then((r) => r.data),
  report: (timeframe) => http.get("/admin/report", { params: { timeframe } }).then((r) => r.data),
};
