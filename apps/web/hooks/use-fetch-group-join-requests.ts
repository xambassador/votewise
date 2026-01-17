"use client";

import type { GetGroupJoinRequestsResponse } from "@votewise/client/group";

import { useQuery } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupNotificationsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchGroupJoinRequests(initialData?: GetGroupJoinRequestsResponse) {
  const query = useQuery({
    queryKey: getGroupNotificationsKey(),
    queryFn: async () => assertResponse(await groupClient.getJoinRequests()),
    initialData
  });
  return query;
}
