"use client";

import type { GetMyGroupsResponse } from "@votewise/client/group";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PAGINATION } from "@votewise/constant";

import { groupClient } from "@/lib/client";
import { getMyGroupsKey } from "@/lib/constants";

type Params = { initialData?: GetMyGroupsResponse };

export function useFetchMyGroups(params: Params) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryClient = useQueryClient();
  const queryKey = getMyGroupsKey();
  const query = useQuery({
    initialData: params.initialData,
    queryKey,
    queryFn: async () => {
      const res = await groupClient.getMyGroups();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    refetchOnWindowFocus: false
  });

  async function fetchNextPage(page: number) {
    setNextPageStatus("loading");
    const res = await groupClient.getAll({ page, limit: PAGINATION.groups.limit });
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetMyGroupsResponse>(queryKey, (oldData) => {
      if (!oldData) return res.data;
      return {
        ...oldData,
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        groups: [...oldData.groups, ...res.data.groups]
      } as GetMyGroupsResponse;
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}
