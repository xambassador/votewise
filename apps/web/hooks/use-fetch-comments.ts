"use client";

import type { GetCommentsResponse } from "@votewise/client/comment";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PAGINATION } from "@votewise/constant";

import { commentClient } from "@/lib/client";
import { getCommentsKey } from "@/lib/constants";

type Options = { initialData?: GetCommentsResponse };

// TODO:
// We have button component, so we can remove all
// <button> elements from ui library and use that instead.
// so we can reference the ButtonProps type from there.
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

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
    const res = await commentClient.getComments(feedId, { page, limit: PAGINATION.comments.limit });
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

  function getTriggerProps(props?: ButtonProps): ButtonProps {
    return {
      ...props,
      onClick: () => {
        if (!query.data) return;
        if (query.data.pagination.next_page === null) return;
        fetchNextPage(query.data.pagination.next_page);
      },
      loading: nextPageStatus === "loading"
    };
  }

  return { ...query, fetchNextPage, nextPageStatus, getTriggerProps };
}
