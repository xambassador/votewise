import { createStore } from "zustand";

import type { MyDetailsResponse } from "@votewise/types";

type User = MyDetailsResponse["data"]["user"];

interface State {
  user: User | null;
  status: "error" | "idle" | "loading" | "success";
  setUser: (user: User) => void;
  setStatus: (status: State["status"]) => void;
}

const store = createStore<State>((set) => ({
  user: null,
  status: "idle",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
}));

export default store;
