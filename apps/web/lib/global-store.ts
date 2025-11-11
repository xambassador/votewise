"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";

type Group = { id: string; name: string };

const notificationCount = atom(0);
const activeGroup = atom<Group | null>(null);

export function useNotificationCount() {
  return useAtomValue(notificationCount);
}

export function useIncrementNotificationCount() {
  const setCount = useSetAtom(notificationCount);
  return () => setCount((c) => c + 1);
}

export function useActiveGroup() {
  return useAtomValue(activeGroup);
}

export function useSetActiveGroup() {
  const setGroup = useSetAtom(activeGroup);
  return (group: Group | null) => setGroup(group);
}
