"use client";

import type { GetFeedResponse } from "@votewise/client/feed";

import { useQuery } from "@tanstack/react-query";

import { feedClient } from "@/lib/client";
import { getFeedKey } from "@/lib/constants";

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
    queryFn: async () => {
      const res = await feedClient.get(feedId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    refetchOnWindowFocus: false
  });
  return query;
}
