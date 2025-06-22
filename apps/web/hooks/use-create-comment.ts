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
              }
            },
            ...oldComments.comments
          ]
        };
      });
      return { previousComments, newCommentId };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(getCommentsKey(feedId), context?.previousComments);
    },
    onSettled: (data, _, __, ctx) => {
      const optimisticId = ctx?.newCommentId;
      // For any action on the comment is depend on a comment id, so invalidate the comments query
      // is not required (at least for now)
      if (!optimisticId || !data) {
        queryClient.invalidateQueries({ queryKey: getCommentsKey(feedId) });
      } else {
        queryClient.setQueryData<GetCommentsResponse>(getCommentsKey(feedId), (oldComments) => {
          if (!oldComments) return oldComments;
          return {
            ...oldComments,
            comments: oldComments.comments.map((comment) => {
              if (comment.id === optimisticId) {
                return { ...comment, id: data.id };
              }
              return comment;
            })
          } as GetCommentsResponse;
        });
      }
    }
  });

  return mutation;
}
