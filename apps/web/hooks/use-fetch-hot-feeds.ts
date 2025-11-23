"use client";

import type { GetHotFeedsResponse } from "@votewise/client/trending";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { trendingClient } from "@/lib/client";
import { getHotFeedsKey } from "@/lib/constants";

type Props = {
  initialData?: GetHotFeedsResponse;
};

export function useFetchHotFeeds(props?: Props) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const qc = useQueryClient();
  const queryKey = getHotFeedsKey();
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await trendingClient.getFeeds();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    initialData: props?.initialData
  });

  async function fetchNextPage(cursor: string) {
    setNextPageStatus("loading");
    const res = await trendingClient.getFeeds({ cursor });
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    qc.setQueryData<GetHotFeedsResponse>(queryKey, (data) => {
      if (!data) return res.data;
      return {
        ...data,
        feeds: [...data.feeds, ...res.data.feeds],
        pagination: {
          ...data.pagination,
          ...res.data.pagination
        }
      };
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}
