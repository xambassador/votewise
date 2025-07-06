"use client";

import { useQuery } from "@tanstack/react-query";

import { commentClient } from "@/lib/client";
import { getRepliesKey } from "@/lib/constants";

export function useFetchReplies(feedId: string, parentId: string) {
  const query = useQuery({
    queryKey: getRepliesKey(feedId, parentId),
    queryFn: async () => {
      const replies = await commentClient.getReplies(feedId, parentId);
      if (!replies.success) {
        throw new Error(replies.error);
      }
      return replies.data;
    },
    initialData: {
      replies: [],
      pagination: {
        current_page: 1,
        has_next_page: false,
        has_previous_page: false,
        next_page: null,
        previous_page: null,
        total_page: 1
      }
    },
    refetchOnWindowFocus: false
  });
  return query;
}
