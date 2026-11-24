import { create } from "zustand";

let nextId = 1;

export const useToastStore = create((set, get) => ({
  toasts: [],
  push: (type, message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, type, message }] }));
    setTimeout(() => get().dismiss(id), type === "error" ? 6000 : 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (m) => useToastStore.getState().push("success", m),
  error: (m) => useToastStore.getState().push("error", m),
};
