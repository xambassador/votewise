"use client";

import type { GetUserGroupsResponse } from "@votewise/client/user";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserGroupsKey } from "@/lib/constants";

export function useFetchUserGroups(props: { username: string }) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryClient = useQueryClient();
  const queryKey = getUserGroupsKey(props.username);
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await userClient.getUserGroups(props.username);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    refetchOnWindowFocus: false
  });

  async function fetchNextPage() {
    setNextPageStatus("loading");
    const res = await userClient.getUserGroups(props.username);
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetUserGroupsResponse>(queryKey, (oldData) => {
      if (!oldData) return res.data;
      return {
        ...oldData,
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        groups: [...oldData.groups, ...res.data.groups]
      } as GetUserGroupsResponse;
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}
