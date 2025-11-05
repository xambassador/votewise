"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { searchClient } from "@/lib/client";
import { getSearchKey } from "@/lib/constants";

import { useSearchCtx } from "../_utils/store";

export function useFetchSearchQuery() {
  const initialQ = useSearchParams().get("query") || "";
  const { query: ctxQuery } = useSearchCtx("useFetchSearchQuery");
  const q = ctxQuery || initialQ;
  const queryKey = getSearchKey(q);
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await searchClient.search(q || "");
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    enabled: !!q
  });
  return { ...query, searchQuery: q };
}
