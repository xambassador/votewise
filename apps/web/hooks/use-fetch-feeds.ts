"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";

import { useInfiniteQuery } from "@tanstack/react-query";

import { feedClient } from "@/lib/client";
import { getFeedsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

type Params = {
  initialData?: GetAllFeedsResponse;
};

export type InfiniteFeedsData = {
  pages: GetAllFeedsResponse[];
  pageParams: (string | undefined)[];
};

export function useFetchFeeds(params: Params) {
  const queryKey = getFeedsKey();

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => assertResponse(await feedClient.getAll({ cursor: pageParam })),
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

  const feeds = query.data?.pages.flatMap((page) => page.feeds) ?? [];

  return {
    ...query,
    feeds
  };
}
