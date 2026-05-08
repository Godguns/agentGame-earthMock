import { create } from "zustand";

export const useAppStore = create((set) => ({
  lastBootCompletedAt: null,
  setLastBootCompletedAt: (value) => set({ lastBootCompletedAt: value }),
}));
