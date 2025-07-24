"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PAGINATION } from "@votewise/constant";

import { feedClient } from "@/lib/client";
import { getFeedsKey } from "@/lib/constants";

type Params = {
  initialData?: GetAllFeedsResponse;
};

export function useFetchFeeds(params: Params) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryClient = useQueryClient();
  const queryKey = getFeedsKey();
  const query = useQuery({
    initialData: params.initialData,
    queryKey,
    queryFn: async () => {
      const res = await feedClient.getAll();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    refetchOnWindowFocus: false
  });

  async function fetchNextPage(page: number) {
    setNextPageStatus("loading");
    const res = await feedClient.getAll({ page, limit: PAGINATION.feeds.limit });
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetAllFeedsResponse>(queryKey, (oldData) => {
      if (!oldData) return res.data;
      return {
        ...oldData,
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        feeds: [...oldData.feeds, ...res.data.feeds]
      } as GetAllFeedsResponse;
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}
