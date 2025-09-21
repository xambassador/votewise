"use client";

import type { GetGroupResponse } from "@votewise/client/group";

import { useQuery } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupKey } from "@/lib/constants";

export function useFetchGroup(id: string, options?: { initialData?: GetGroupResponse }) {
  const queryKey = getGroupKey(id);
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await groupClient.get(id);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    initialData: options?.initialData
  });
  return query;
}
