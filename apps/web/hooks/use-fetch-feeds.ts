"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { feedClient } from "@/lib/client";
import { getFeedsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

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
    queryFn: async () => assertResponse(await feedClient.getAll()),
    refetchOnWindowFocus: false
  });

  async function fetchNextPage(cursor: string) {
    setNextPageStatus("loading");
    const res = await feedClient.getAll({ cursor });
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
