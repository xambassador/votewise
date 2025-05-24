"use client";

import type { Me } from "@/types";
import type { PropsWithChildren } from "react";

import { createContext } from "@votewise/ui/context";

const [Provider, useMe] = createContext<Me>("UserProvider");

export { useMe };

export function UserProvider(props: PropsWithChildren<{ user: Me }>) {
  return <Provider {...props.user}>{props.children}</Provider>;
}
