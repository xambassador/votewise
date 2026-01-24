"use client";

import type { Me } from "@/types";
import type { PropsWithChildren } from "react";

import { useCallback, useEffect, useState } from "react";

import { createContext } from "@votewise/ui/context";

type DispatcherState = { update: (user: Partial<Me>) => void };

const [Provider, useMe] = createContext<Me>("UserProvider");
const [DispatcherProvider, useUpdateMe] = createContext<DispatcherState>("UserUpdateDispatcher");

export { useMe, useUpdateMe };

export function UserProvider(props: PropsWithChildren<{ user: Me }>) {
  const [user, setUser] = useState(props.user);

  const updateUser = useCallback((user: Partial<Me>) => {
    setUser((prev) => ({ ...prev, ...user }));
  }, []);

  useEffect(() => {
    setUser(props.user);
  }, [props.user]);

  return (
    <Provider {...user}>
      <DispatcherProvider update={updateUser}>{props.children}</DispatcherProvider>
    </Provider>
  );
}
