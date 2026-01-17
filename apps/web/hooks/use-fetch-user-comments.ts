"use client";

import type { GetUserCommentsResponse } from "@votewise/client/user";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserCommentsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchUserComments(props: { username: string }) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryClient = useQueryClient();
  const queryKey = getUserCommentsKey(props.username);
  const query = useQuery({
    queryKey,
    queryFn: async () => assertResponse(await userClient.getUserComments(props.username)),
    refetchOnWindowFocus: false
  });

  async function fetchNextPage() {
    setNextPageStatus("loading");
    const res = await userClient.getUserComments(props.username);
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetUserCommentsResponse>(queryKey, (oldData) => {
      if (!oldData) return res.data;
      return {
        ...oldData,
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        comments: [...oldData.comments, ...res.data.comments]
      } as GetUserCommentsResponse;
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}
