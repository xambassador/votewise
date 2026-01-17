"use client";

import type { GetFeedResponse } from "@votewise/client/feed";

import { useQuery } from "@tanstack/react-query";

import { feedClient } from "@/lib/client";
import { getFeedKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

type Params = {
  initialData?: GetFeedResponse;
  feedId: string;
};

export function useFetchFeed(params: Params) {
  const { feedId } = params;
  const queryKey = getFeedKey(feedId);
  const query = useQuery({
    initialData: params.initialData,
    queryKey,
    queryFn: async () => assertResponse(await feedClient.get(feedId)),
    refetchOnWindowFocus: false
  });
  return query;
}
