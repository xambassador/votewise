"use client";

import type { GetCommentsResponse, GetRepliesResponse } from "@votewise/client/comment";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PAGINATION } from "@votewise/constant";

import { commentClient } from "@/lib/client";
import { getRepliesKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

// TODO:
// We have button component, so we can remove all
// <button> elements from ui library and use that instead.
// so we can reference the ButtonProps type from there.
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };
type Opts = {
  feedId: string;
  parentId: string;
  initialData?: {
    replies: GetCommentsResponse["comments"][0]["replies"];
    pagination: GetCommentsResponse["comments"][0]["pagination"];
  };
};

export function useFetchReplies(options: Opts) {
  const { feedId, parentId, initialData } = options;
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: getRepliesKey(feedId, parentId),
    queryFn: async () => assertResponse(await commentClient.getReplies(feedId, parentId)),
    initialData,
    refetchOnWindowFocus: false
  });

  async function fetchNextPage(page: number) {
    setNextPageStatus("loading");
    const res = await commentClient.getReplies(feedId, parentId, { page, limit: PAGINATION.comments.reply.limit });
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetRepliesResponse>(getRepliesKey(feedId, parentId), (oldData) => {
      if (!oldData) return res.data;
      return {
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        replies: [...oldData.replies, ...res.data.replies]
      } as GetRepliesResponse;
    });
    setNextPageStatus("success");
  }

  function getTriggerProps(props?: ButtonProps): ButtonProps {
    return {
      ...props,
      onClick: () => {
        if (!query.data) return;
        if (!query.data.pagination.next_page) return;
        fetchNextPage(query.data.pagination.next_page);
      },
      loading: nextPageStatus === "loading"
    };
  }

  return { ...query, fetchNextPage, nextPageStatus, getTriggerProps };
}
