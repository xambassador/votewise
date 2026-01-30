"use client";

import type { GetUserCommentsResponse } from "@votewise/client/user";

import { useInfiniteQuery } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserCommentsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

type Params = {
  username: string;
  initialData?: GetUserCommentsResponse;
};

export function useFetchUserComments(params: Params) {
  const queryKey = getUserCommentsKey(params.username);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) =>
      assertResponse(await userClient.getUserComments(params.username, { cursor: pageParam })),
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

  const comments = query.data?.pages.flatMap((page) => page.comments) ?? [];

  return {
    ...query,
    comments
  };
}
