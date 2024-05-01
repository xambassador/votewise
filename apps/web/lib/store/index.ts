import type { MyDetailsResponse } from "@votewise/types";

import { createStore } from "zustand";

export type User = MyDetailsResponse["data"]["user"];

interface State {
  user: User | null;
  setUser: (user: User) => void;
}

const store = createStore<State>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export default store;
