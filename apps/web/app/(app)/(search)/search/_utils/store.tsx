"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { createContext } from "@votewise/ui/context";

const [Provider, useProvider] = createContext<{ query: string; setQuery: (q: string) => void }>("SearchQueryProvider");

export function SearchQueryProvider(props: React.PropsWithChildren) {
  const query = useSearchParams().get("query") || "";
  const [q, setQ] = useState(query);
  return (
    <Provider query={q} setQuery={(q) => setQ(q)}>
      {props.children}
    </Provider>
  );
}

export const useSearchCtx = useProvider;
