import { create } from "zustand";

import { fetchWorldState, submitWorldAction } from "../../services/earthMockApi";

const DEFAULT_WORLD_STATE = {
  money: {
    balance: 3860,
    income_monthly: 6200,
    expense_monthly: 2540,
    pressure: 0.38,
  },
  health: {
    energy: 0.72,
    sleep: 0.64,
    body: 0.81,
  },
  mood: {
    stability: 0.58,
    anxiety: 0.42,
    loneliness: 0.27,
  },
  relations: {
    mother: 0.74,
    friends: 0.55,
    work: 0.62,
    institution: 0.48,
  },
  time: {
    day_label: "周三 晚上",
    deadline_label: "房租 3 天后到期",
    phase_key: "life_bootstrap",
  },
  events: [],
  actions: [],
  journal: [],
};

export const useWorldStore = create((set, get) => ({
  ...DEFAULT_WORLD_STATE,
  status: "idle",
  error: "",
  hydrateWorld: async (token) => {
    if (!token) {
      return null;
    }

    set({ status: "loading", error: "" });
    try {
      const payload = await fetchWorldState(token);
      set({
        ...payload,
        status: "ready",
        error: "",
      });
      return payload;
    } catch (error) {
      set({
        status: "error",
        error: error.message || "World state load failed",
      });
      throw error;
    }
  },
  applyChoice: async (actionKey, token) => {
    if (!token) {
      return null;
    }

    set({ status: "loading", error: "" });
    try {
      const payload = await submitWorldAction(actionKey, token);
      set({
        ...payload,
        status: "ready",
        error: "",
      });
      return payload;
    } catch (error) {
      set({
        status: "error",
        error: error.message || "World action failed",
      });
      throw error;
    }
  },
}));
