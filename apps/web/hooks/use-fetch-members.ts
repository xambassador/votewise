"use client";

import { useQuery } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getMembersKey } from "@/lib/constants";

export function useFetchMembers(groupId: string) {
  const query = useQuery({
    queryKey: getMembersKey(groupId),
    queryFn: async () => {
      const res = await groupClient.getMembers(groupId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    }
  });
  return query;
}
