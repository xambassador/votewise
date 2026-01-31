"use client";

import type { GetGroupFeedsResponse } from "@votewise/client/group";

import { useInfiniteQuery } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupFeedsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchGroupFeeds(id: string, options?: { initialData?: GetGroupFeedsResponse }) {
  const queryKey = getGroupFeedsKey(id);
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => assertResponse(await groupClient.getFeeds(id, { cursor: pageParam })),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.cursor ?? undefined,
    initialData: options?.initialData
      ? {
          pages: [options.initialData],
          pageParams: [undefined]
        }
      : undefined
  });

  const feeds = query.data?.pages.flatMap((page) => page.feeds) ?? [];
  const status = query.status as "pending" | "error" | "success";

  return { ...query, status, feeds };
}
