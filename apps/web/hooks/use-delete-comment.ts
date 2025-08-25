"use client";

import type { GetCommentsResponse, GetRepliesResponse } from "@votewise/client/comment";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { commentClient } from "@/lib/client";
import { getCommentsKey, getRepliesKey } from "@/lib/constants";

export function useDeleteComment(feedId: string, commentId: string, parentId?: string) {
  const commentsKey = getCommentsKey(feedId);
  const repliesKey = getRepliesKey(feedId, parentId || "");
  const queryClient = useQueryClient();

  async function deleteReply() {
    await queryClient.cancelQueries({ queryKey: repliesKey });
    const previousData = queryClient.getQueryData<GetRepliesResponse>(repliesKey);
    queryClient.setQueryData<GetRepliesResponse>(repliesKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        replies: old.replies.filter((reply) => reply.id !== commentId)
      } as GetRepliesResponse;
    });
    return { previousData };
  }

  async function deleteComment() {
    await queryClient.cancelQueries({ queryKey: commentsKey });
    const previousData = queryClient.getQueryData<GetCommentsResponse>(commentsKey);
    queryClient.setQueryData<GetCommentsResponse>(commentsKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        comments: old.comments.filter((comment) => comment.id !== commentId)
      } as GetCommentsResponse;
    });
    return { previousData };
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await commentClient.delete(feedId, commentId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onMutate: async () => {
      if (parentId) {
        const { previousData } = await deleteReply();
        return { previousData };
      }
      const { previousData } = await deleteComment();
      return { previousData };
    },
    onError: (_, __, ctx) => {
      if (parentId) {
        queryClient.setQueryData<GetRepliesResponse>(repliesKey, ctx?.previousData as GetRepliesResponse);
      } else {
        queryClient.setQueryData<GetCommentsResponse>(commentsKey, ctx?.previousData as GetCommentsResponse);
      }
    },
    onSettled: async () => {}
  });
  return mutation;
}
