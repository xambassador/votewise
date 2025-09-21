"use client";

import type { GetGroupJoinRequestsResponse } from "@votewise/client/group";

import { useQuery } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupNotificationsKey } from "@/lib/constants";

export function useFetchGroupJoinRequests(initialData?: GetGroupJoinRequestsResponse) {
  const query = useQuery({
    queryKey: getGroupNotificationsKey(),
    queryFn: async () => {
      const res = await groupClient.getJoinRequests();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    initialData
  });
  return query;
}
