"use client";

import type { GetAllGroupsResponse } from "@votewise/client/group";

import { useInfiniteQuery } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

type Params = {
  initialData?: GetAllGroupsResponse;
};

export function useFetchGroups(params: Params) {
  const queryKey = getGroupsKey();

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => assertResponse(await groupClient.getAll({ cursor: pageParam })),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.cursor ?? undefined,
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
