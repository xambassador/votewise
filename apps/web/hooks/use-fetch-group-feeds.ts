"use client";

import type { GetGroupFeedsResponse } from "@votewise/client/group";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupFeedsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchGroupFeeds(id: string, options?: { initialData?: GetGroupFeedsResponse }) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryKey = getGroupFeedsKey(id);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: async () => assertResponse(await groupClient.getFeeds(id)),
    initialData: options?.initialData
  });

  async function fetchNextPage(cursor: string) {
    setNextPageStatus("loading");
    const res = await groupClient.getFeeds(id, { cursor });
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetGroupFeedsResponse>(queryKey, (oldData) => {
      if (!oldData) return res.data;
      return {
        ...oldData,
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        feeds: [...oldData.feeds, ...res.data.feeds]
      } as GetGroupFeedsResponse;
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}
