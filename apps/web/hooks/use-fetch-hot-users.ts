"use client";

import type { GetHotUsersResponse } from "@votewise/client/trending";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { trendingClient } from "@/lib/client";
import { getHotUsersKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

type Props = {
  initialData?: GetHotUsersResponse;
};

export function useFetchHotUsers(props?: Props) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const qc = useQueryClient();
  const queryKey = getHotUsersKey();
  const query = useQuery({
    queryKey,
    queryFn: async () => assertResponse(await trendingClient.getUsers()),
    initialData: props?.initialData
  });

  async function fetchNextPage(cursor: string) {
    setNextPageStatus("loading");
    const res = await trendingClient.getUsers({ cursor });
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    qc.setQueryData<GetHotUsersResponse>(queryKey, (data) => {
      if (!data) return res.data;
      return {
        ...data,
        users: [...data.users, ...res.data.users],
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
