import { create } from "zustand";
import { authApi } from "../lib/api";

export const useAuthStore = create((set) => ({
  user: null,
  ready: false, // true once the first session check has finished

  checkAuth: async () => {
    try {
      set({ user: await authApi.me(), ready: true });
    } catch {
      set({ user: null, ready: true });
    }
  },

  // These throw on failure so the calling form can show the server's message next to the fields.
  login: async (credentials) => set({ user: await authApi.login(credentials) }),
  register: async (formData) => set({ user: await authApi.register(formData) }),
  updateProfile: async (formData) => set({ user: await authApi.updateProfile(formData) }),

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null });
    }
  },
}));
