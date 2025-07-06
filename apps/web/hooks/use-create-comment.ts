"use client";

import type { GetCommentsResponse } from "@votewise/client/comment";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useMe } from "@/components/user-provider";

import { commentClient } from "@/lib/client";
import { getCommentsKey } from "@/lib/constants";

type CreateCommentParams = Parameters<typeof commentClient.createComment>[1];

let idCounter = 0;

export function useCreateComment(feedId: string) {
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
      await queryClient.cancelQueries({ queryKey: getCommentsKey(feedId) });
      const previousComments = queryClient.getQueryData(getCommentsKey(feedId));
      const newCommentId = `temp-${++idCounter}`;

      if (variables.parent_id) {
        // This is a reply
        queryClient.setQueryData<GetCommentsResponse>(getCommentsKey(feedId), (oldComments) => {
          if (!oldComments) return oldComments;
          const comments = oldComments.comments.map((comment) => {
            if (comment.id === variables.parent_id) {
              const replies = [
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
                ...comment.replies
              ];
              return {
                ...comment,
                replies
              };
            }
            return comment;
          });
          return { comments, pagination: { ...oldComments.pagination } };
        });
        return { previousComments, newCommentId };
      }

      queryClient.setQueryData<GetCommentsResponse>(getCommentsKey(feedId), (oldComments) => {
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
    onError: (_, __, context) => {
      queryClient.setQueryData(getCommentsKey(feedId), context?.previousComments);
    },
    onSettled: (data, _, variables, ctx) => {
      const isReply = !!variables.parent_id;
      const optimisticId = ctx?.newCommentId;
      // For any action on the comment is depend on a comment id, so invalidate the comments query
      // is not required (at least for now)
      if (!optimisticId || !data) {
        queryClient.invalidateQueries({ queryKey: getCommentsKey(feedId) });
      } else {
        if (isReply) {
          queryClient.setQueryData<GetCommentsResponse>(getCommentsKey(feedId), (oldComments) => {
            if (!oldComments) return oldComments;
            const comments = oldComments.comments.map((comment) => {
              if (comment.id === variables.parent_id) {
                const replies = comment.replies.map((reply) => {
                  if (reply.id === optimisticId) {
                    return { ...reply, id: data.id };
                  }
                  return reply;
                });
                return { ...comment, replies };
              }
              return comment;
            });
            return { comments, pagination: { ...oldComments.pagination } } as GetCommentsResponse;
          });
          return;
        }

        queryClient.setQueryData<GetCommentsResponse>(getCommentsKey(feedId), (oldComments) => {
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
