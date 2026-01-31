"use client";

import type { GetMyGroupsResponse } from "@votewise/client/group";

import { useInfiniteQuery } from "@tanstack/react-query";

import { PAGINATION } from "@votewise/constant";

import { groupClient } from "@/lib/client";
import { getMyGroupsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

type Params = { initialData?: GetMyGroupsResponse };

export function useFetchMyGroups(params: Params) {
  const queryKey = getMyGroupsKey();
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) =>
      assertResponse(await groupClient.getMyGroups({ page: pageParam, limit: PAGINATION.groups.limit })),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.pagination.next_page ?? undefined,
    initialData: params.initialData
      ? {
          pages: [params.initialData],
          pageParams: [undefined]
        }
      : undefined,
    refetchOnWindowFocus: false
  });

  const groups = query.data?.pages.flatMap((page) => page.groups) ?? [];

  return {
    ...query,
    groups
  };
}
