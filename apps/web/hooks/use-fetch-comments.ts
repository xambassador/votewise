"use client";

import type { GetCommentsResponse } from "@votewise/client/comment";

import { useQuery } from "@tanstack/react-query";

import { commentClient } from "@/lib/client";
import { getCommentsKey } from "@/lib/constants";

type Options = { initialData?: GetCommentsResponse };

export function useFetchComments(feedId: string, options?: Options) {
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
  return query;
}
