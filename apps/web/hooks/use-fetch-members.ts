"use client";

import { useQuery } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getMembersKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchMembers(groupId: string) {
  const query = useQuery({
    queryKey: getMembersKey(groupId),
    queryFn: async () => assertResponse(await groupClient.getMembers(groupId))
  });
  return query;
}
