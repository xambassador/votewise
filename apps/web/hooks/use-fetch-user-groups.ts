"use client";

import type { GetUserGroupsResponse } from "@votewise/client/user";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserGroupsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

type Params = {
  username: string;
  initialData?: GetUserGroupsResponse;
};

export function useFetchUserGroups(params: Params) {
  const queryKey = getUserGroupsKey(params.username);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) =>
      assertResponse(await userClient.getUserGroups(params.username, { cursor: pageParam })),
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

export function usePrefetchUserGroups(params: Omit<Params, "initialData">) {
  const queryKey = getUserGroupsKey(params.username);
  const qc = useQueryClient();
  return () => {
    // @ts-expect-error @fixme
    qc.prefetchInfiniteQuery({
      queryKey,
      queryFn: async () => assertResponse(await userClient.getUserGroups(params.username))
    });
  };
}
