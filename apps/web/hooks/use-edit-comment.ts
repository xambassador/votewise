"use client";

import type { GetCommentsResponse, GetRepliesResponse } from "@votewise/client/comment";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { commentClient } from "@/lib/client";
import { getCommentsKey, getRepliesKey } from "@/lib/constants";
import { assertResponse, renderErrorToast } from "@/lib/error";

type UpdateParams = Parameters<typeof commentClient.update>[2];

export function useEditComment(feedId: string, commentId: string, parentId?: string) {
  const queryClient = useQueryClient();
  const commentsKey = getCommentsKey(feedId);
  const repliesKey = getRepliesKey(feedId, parentId ?? "");
  const mutation = useMutation({
    mutationKey: ["editComment", feedId, commentId],
    mutationFn: async (data: UpdateParams) => assertResponse(await commentClient.update(feedId, commentId, data)),
    onMutate: async (variables) => {
      if (parentId) {
        await queryClient.cancelQueries({ queryKey: repliesKey });
        const replies = queryClient.getQueryData<GetRepliesResponse>(repliesKey);
        queryClient.setQueryData<GetRepliesResponse>(repliesKey, (oldReplies) => {
          if (!oldReplies) return oldReplies;
          return {
            ...oldReplies,
            replies: oldReplies.replies.map((reply) => {
              if (reply.id === commentId) {
                return { ...reply, text: variables.text, updated_at: new Date().toISOString() };
              }
              return reply;
            })
          } as GetRepliesResponse;
        });
        return { previousComments: replies };
      }

      await queryClient.cancelQueries({ queryKey: commentsKey });
      const previousComments = queryClient.getQueryData<GetCommentsResponse>(commentsKey);
      queryClient.setQueryData<GetCommentsResponse>(commentsKey, (oldComments) => {
        if (!oldComments) return oldComments;
        return {
          ...oldComments,
          comments: oldComments.comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                text: variables.text,
                updated_at: new Date().toISOString(),
                is_edited: true
              };
            }
            return comment;
          })
        } as GetCommentsResponse;
      });
      return { previousComments };
    },
    onError: (err, __, ctx) => {
      renderErrorToast(err, { showOnSandboxError: false });
      if (parentId) {
        queryClient.setQueryData<GetRepliesResponse>(repliesKey, ctx?.previousComments as GetRepliesResponse);
      } else {
        queryClient.setQueryData<GetCommentsResponse>(commentsKey, ctx?.previousComments as GetCommentsResponse);
      }
    }
  });
  return mutation;
}
