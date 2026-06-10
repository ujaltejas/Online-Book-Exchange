import { create } from "zustand";
import axiosInstance from "../utils/axios";

const useBookStore = create((set, get) => ({
  books: [],
  userBooks: [],
  currentBook: null,
  loading: false,
  error: null,

  createBook: async (bookData) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();

      Object.keys(bookData).forEach((key) => {
        if (key !== "images" && bookData[key] !== undefined && bookData[key] !== null) {
          formData.append(key, bookData[key]);
        }
      });

      if (bookData.images && bookData.images.length > 0) {
        Array.from(bookData.images).forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await axiosInstance.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const userBooks = get().userBooks;
      set({
        userBooks: [response.data.book, ...userBooks],
        currentBook: response.data.book,
        loading: false,
      });

      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create book",
        loading: false,
      });
      throw error;
    }
  },

  getAllBooks: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await axiosInstance.get(`/post?${queryParams.toString()}`);
      set({ books: response.data.books || [], loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch books",
        loading: false,
      });
      throw error;
    }
  },

  getBookById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/post/${id}`);
      set({ currentBook: response.data.book, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch book",
        loading: false,
      });
      throw error;
    }
  },

  getUserBooks: async (userId = null) => {
    set({ loading: true, error: null });
    try {
      const url = userId ? `/post/user?userId=${userId}` : "/post/user";
      const response = await axiosInstance.get(url);
      set({ userBooks: response.data.books || [], loading: false });
      return response.data;
    } catch (error) {
      console.error("Error fetching user books:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch your listings",
        loading: false,
        userBooks: [],
      });
      throw error;
    }
  },

  updateBook: async (id, bookData) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();

      Object.keys(bookData).forEach((key) => {
        if (key !== "images" && key !== "removedImages" && bookData[key] !== undefined && bookData[key] !== null) {
          formData.append(key, bookData[key]);
        }
      });

      if (bookData.images && bookData.images.length > 0) {
        Array.from(bookData.images).forEach((image) => {
          formData.append("images", image);
        });
      }

      if (bookData.removedImages && bookData.removedImages.length > 0) {
        formData.append("removedImages", JSON.stringify(bookData.removedImages));
      }

      const response = await axiosInstance.put(`/post/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const userBooks = get().userBooks.map((b) =>
        b._id === id ? response.data.book : b
      );

      set({
        userBooks,
        currentBook: response.data.book,
        loading: false,
      });

      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update book",
        loading: false,
      });
      throw error;
    }
  },

  deleteBook: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/post/${id}`);

      const userBooks = get().userBooks.filter((b) => b._id !== id);

      set({
        userBooks,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete book",
        loading: false,
      });
      throw error;
    }
  },

  manageBookImages: async (id, { addImages, removeImages }) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();

      if (addImages && addImages.length > 0) {
        Array.from(addImages).forEach((image) => {
          formData.append("images", image);
        });
      }

      if (removeImages && removeImages.length > 0) {
        formData.append("removeImages", JSON.stringify(removeImages));
      }

      const response = await axiosInstance.patch(`/post/${id}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const userBooks = get().userBooks.map((b) =>
        b._id === id ? response.data.book : b
      );

      set({
        userBooks,
        currentBook: response.data.book,
        loading: false,
      });

      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to manage images",
        loading: false,
      });
      throw error;
    }
  },

  contactBookOwner: async (id, contactData) => {
    const response = await axiosInstance.post(`/post/${id}/contact`, contactData);
    return response.data;
  },

  clearCurrentBook: () => {
    set({ currentBook: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useBookStore;
