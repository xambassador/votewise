"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";

const notificationCount = atom(0);

export function useNotificationCount() {
  return useAtomValue(notificationCount);
}

export function useIncrementNotificationCount() {
  const setCount = useSetAtom(notificationCount);
  return () => setCount((c) => c + 1);
}
