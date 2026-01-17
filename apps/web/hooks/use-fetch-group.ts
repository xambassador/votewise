"use client";

import type { GetGroupResponse } from "@votewise/client/group";

import { useQuery } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchGroup(id: string, options?: { initialData?: GetGroupResponse }) {
  const queryKey = getGroupKey(id);
  const query = useQuery({
    queryKey,
    queryFn: async () => assertResponse(await groupClient.get(id)),
    initialData: options?.initialData
  });
  return query;
}
