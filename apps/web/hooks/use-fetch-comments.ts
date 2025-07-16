"use client";

import type { GetCommentsResponse } from "@votewise/client/comment";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { commentClient } from "@/lib/client";
import { getCommentsKey } from "@/lib/constants";

type Options = { initialData?: GetCommentsResponse };

export function useFetchComments(feedId: string, options?: Options) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: getCommentsKey(feedId),
    queryFn: async () => {
      const comments = await commentClient.getComments(feedId);
      if (!comments.success) {
        throw new Error(comments.error);
      }
      return comments.data;
    },
    refetchOnWindowFocus: false,
    initialData: options?.initialData
  });

  async function fetchNextPage(page: number) {
    setNextPageStatus("loading");
    const res = await commentClient.getComments(feedId, { page, limit: 10 });
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetCommentsResponse>(getCommentsKey(feedId), (oldData) => {
      if (!oldData) return res.data;
      return {
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        comments: [...oldData.comments, ...res.data.comments]
      };
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}
