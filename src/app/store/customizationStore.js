import { create } from "zustand";

const STORAGE_KEY = "earth-online-customization";

function readStoredCustomization() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistCustomization(nextState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      phoneWallpaper: nextState.phoneWallpaper,
      pcWallpaper: nextState.pcWallpaper,
    }),
  );
}

function createWallpaperSetter(set, key) {
  return (value) => {
    set((state) => {
      const nextState = {
        ...state,
        [key]: value || "",
      };
      persistCustomization(nextState);
      return nextState;
    });
  };
}

const stored = readStoredCustomization();

export const useCustomizationStore = create((set) => ({
  phoneWallpaper: typeof stored.phoneWallpaper === "string" ? stored.phoneWallpaper : "",
  pcWallpaper: typeof stored.pcWallpaper === "string" ? stored.pcWallpaper : "",
  setPhoneWallpaper: createWallpaperSetter(set, "phoneWallpaper"),
  setPcWallpaper: createWallpaperSetter(set, "pcWallpaper"),
}));
