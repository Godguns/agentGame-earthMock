import { create } from "zustand";

import {
  bindPersonaProfile,
  fetchCurrentUser,
  fetchPersona,
  loginAccount,
  registerAccount,
} from "../../services/earthMockApi";

const STORAGE_KEY = "earth-online-auth";

function readStoredSession() {
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

function persistSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session?.token) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token: session.token,
      user: session.user,
      persona: session.persona || null,
    }),
  );
}

const storedSession = readStoredSession();

export function hasBoundPersona(persona) {
  return Boolean(
    persona?.raw_settings?.profileVersion &&
      persona?.raw_settings?.identity?.location?.city,
  );
}

export const useAuthStore = create((set, get) => ({
  token: typeof storedSession.token === "string" ? storedSession.token : "",
  user: storedSession.user || null,
  persona: storedSession.persona || null,
  status: "idle",
  error: "",
  personaStatus: storedSession.token ? "idle" : "idle",
  personaError: "",
  personaSyncStatus: "idle",
  personaSyncError: "",
  isAuthenticated: Boolean(storedSession.token),
  setSession: ({ token, user, persona = get().persona }) => {
    persistSession({ token, user, persona });
    set({
      token,
      user,
      persona,
      isAuthenticated: Boolean(token),
      status: "authenticated",
      error: "",
    });
  },
  setPersona: (persona) => {
    const { token, user } = get();
    persistSession({ token, user, persona });
    set({
      persona,
      personaStatus: "ready",
      personaError: "",
    });
  },
  clearSession: () => {
    persistSession(null);
    set({
      token: "",
      user: null,
      persona: null,
      isAuthenticated: false,
      status: "idle",
      error: "",
      personaStatus: "idle",
      personaError: "",
      personaSyncStatus: "idle",
      personaSyncError: "",
    });
  },
  login: async ({ account, password }) => {
    set({ status: "loading", error: "" });

    try {
      const response = await loginAccount({ account, password });
      get().setSession({
        token: response.access_token,
        user: response.user,
        persona: null,
      });
      await get().loadPersona();
      return response;
    } catch (error) {
      set({
        status: "error",
        error: error.message || "Login failed",
      });
      throw error;
    }
  },
  register: async ({ email, username, password }) => {
    set({ status: "loading", error: "" });

    try {
      const response = await registerAccount({ email, username, password });
      get().setSession({
        token: response.access_token,
        user: response.user,
        persona: null,
      });
      await get().loadPersona();
      return response;
    } catch (error) {
      set({
        status: "error",
        error: error.message || "Register failed",
      });
      throw error;
    }
  },
  restoreMe: async () => {
    const { token } = get();

    if (!token) {
      return null;
    }

    set({ status: "loading", error: "" });

    try {
      const user = await fetchCurrentUser(token);
      let persona = get().persona;

      try {
        persona = await fetchPersona(token);
      } catch (personaError) {
        if (personaError.status === 401 || personaError.status === 403) {
          get().clearSession();
          return null;
        }

        set({
          personaStatus: "error",
          personaError: personaError.message || "Failed to load persona",
        });
      }

      persistSession({ token, user, persona });
      set({
        user,
        persona,
        isAuthenticated: true,
        status: "authenticated",
        error: "",
        personaStatus: persona ? "ready" : "idle",
        personaError: "",
      });
      return user;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        get().clearSession();
        return null;
      }

      set({
        status: "idle",
        error: error.message || "Session expired",
      });
      return null;
    }
  },
  loadPersona: async () => {
    const { token } = get();

    if (!token) {
      return null;
    }

    set({ personaStatus: "loading", personaError: "" });

    try {
      const persona = await fetchPersona(token);
      get().setPersona(persona);
      return persona;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        get().clearSession();
        return null;
      }

      set({
        personaStatus: "error",
        personaError: error.message || "Failed to load persona",
      });
      return null;
    }
  },
  syncPersona: async (profile) => {
    const { token } = get();

    if (!token || !profile) {
      return null;
    }

    set({ personaSyncStatus: "syncing", personaSyncError: "" });

    try {
      const persona = await bindPersonaProfile(profile, token);
      get().setPersona(persona);
      set({
        personaSyncStatus: "synced",
        personaSyncError: "",
        personaStatus: "ready",
        personaError: "",
      });
      return persona;
    } catch (error) {
      set({
        personaSyncStatus: "error",
        personaSyncError: error.message || "Persona sync failed",
      });
      throw error;
    }
  },
}));
