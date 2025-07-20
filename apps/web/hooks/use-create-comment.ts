"use client";

import type { GetCommentsResponse, GetRepliesResponse } from "@votewise/client/comment";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useMe } from "@/components/user-provider";

import { commentClient } from "@/lib/client";
import { getCommentsKey, getRepliesKey } from "@/lib/constants";

type CreateCommentParams = Parameters<typeof commentClient.createComment>[1];

let idCounter = 0;

export function useCreateComment(feedId: string) {
  const commentsKey = getCommentsKey(feedId);
  const queryClient = useQueryClient();
  const currentUser = useMe("useCreateComment");
  const mutation = useMutation({
    mutationKey: ["createComment", feedId],
    mutationFn: async (data: CreateCommentParams) => {
      const res = await commentClient.createComment(feedId, data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onMutate: async (variables) => {
      const newCommentId = `temp-${++idCounter}`;
      const repliesKey = getRepliesKey(feedId, variables.parent_id || "");

      if (variables.parent_id) {
        // This is a reply
        await queryClient.cancelQueries({ queryKey: repliesKey });
        const previousReplies = queryClient.getQueryData<GetRepliesResponse>(repliesKey);
        queryClient.setQueryData<GetRepliesResponse>(repliesKey, (oldReplies) => {
          if (!oldReplies) return oldReplies;
          return {
            ...oldReplies,
            replies: [
              {
                id: newCommentId,
                text: variables.text,
                created_at: new Date(),
                updated_at: new Date(),
                user: {
                  avatar_url: currentUser.avatar_url,
                  first_name: currentUser.first_name,
                  last_name: currentUser.last_name,
                  user_name: currentUser.username,
                  id: currentUser.id
                }
              },
              ...oldReplies.replies
            ]
          } as GetRepliesResponse;
        });
        return { previousComments: previousReplies, newCommentId };
      }

      await queryClient.cancelQueries({ queryKey: commentsKey });
      const previousComments = queryClient.getQueryData(commentsKey);
      queryClient.setQueryData<GetCommentsResponse>(commentsKey, (oldComments) => {
        if (!oldComments) return oldComments;
        return {
          ...oldComments,
          comments: [
            {
              id: newCommentId,
              text: variables.text,
              created_at: new Date(),
              updated_at: new Date(),
              user: {
                avatar_url: currentUser.avatar_url,
                first_name: currentUser.first_name,
                last_name: currentUser.last_name,
                user_name: currentUser.username,
                id: currentUser.id
              },
              replies: []
            },
            ...oldComments.comments
          ],
          pagination:
            oldComments.comments.length === 0
              ? {
                  current_page: 1,
                  total_page: 1,
                  has_next_page: false,
                  has_previous_page: false,
                  next_page: null,
                  previous_page: null
                }
              : { ...oldComments.pagination }
        } as GetCommentsResponse;
      });
      return { previousComments, newCommentId };
    },
    onError: (_, variables, context) => {
      if (variables.parent_id) {
        queryClient.setQueryData<GetRepliesResponse>(
          getRepliesKey(feedId, variables.parent_id || ""),
          context?.previousComments as GetRepliesResponse
        );
      } else {
        queryClient.setQueryData<GetCommentsResponse>(commentsKey, context?.previousComments as GetCommentsResponse);
      }
    },
    onSettled: (data, _, variables, ctx) => {
      const isReply = !!variables.parent_id;
      const optimisticId = ctx?.newCommentId;
      const repliesKey = getRepliesKey(feedId, variables.parent_id || "");
      // Any actions on the comment will depend on the comment id, so invalidate the comments query
      // is not required (at least for now)
      if (!optimisticId || !data) {
        if (!isReply) {
          queryClient.invalidateQueries({ queryKey: commentsKey });
        } else {
          queryClient.invalidateQueries({ queryKey: repliesKey });
        }
      } else {
        if (isReply) {
          queryClient.setQueryData<GetRepliesResponse>(repliesKey, (oldReplies) => {
            if (!oldReplies) return oldReplies;
            return {
              ...oldReplies,
              replies: oldReplies.replies.map((reply) => {
                if (reply.id === optimisticId) {
                  return { ...reply, id: data.id };
                }
                return reply;
              })
            } as GetRepliesResponse;
          });
          return;
        }

        queryClient.setQueryData<GetCommentsResponse>(commentsKey, (oldComments) => {
          if (!oldComments) return oldComments;
          return {
            ...oldComments,
            comments: oldComments.comments.map((comment) => {
              if (comment.id === optimisticId) {
                return { ...comment, id: data.id };
              }
              return comment;
            }),
            pagination: { ...oldComments.pagination }
          } as GetCommentsResponse;
        });
      }
    }
  });
  return mutation;
}
