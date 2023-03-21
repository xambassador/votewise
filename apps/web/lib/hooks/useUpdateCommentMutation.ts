import { useMutation } from "react-query";
import type { InfiniteData, QueryClient } from "react-query";

import type { GetPostCommentsResponse, UpdateCommentResponse } from "@votewise/types";

import { updateComment } from "services/post";

type Variables = {
  postId: number;
  commentId: number;
  comment: string;
};

type Options<T> = {
  onMutate?: (data: Variables) => {
    previousComments?: InfiniteData<GetPostCommentsResponse> | undefined;
    previousData?: InfiniteData<T> | undefined;
  };
  onSuccess?: (data: UpdateCommentResponse, variables: Variables, context: unknown) => void;
  onError?: (
    error: any,
    variables: Variables,
    context:
      | {
          previousComments?: InfiniteData<GetPostCommentsResponse> | undefined;
          previousData?: InfiniteData<T> | undefined;
        }
      | undefined
  ) => void;
};

/**
 * @description Update comment mutation hook. This hook will update the comment in the cache.
 * By default, it will update the comment in the comments query. Becasue we have two types of queries for comments,
 * one for comments and one for replies. For updating replies, consumer needs to pass the onMutate option.
 * @param queryClient QueryClient instance
 * @param options
 * @returns
 */
export function useUpdateCommentMutation<T>(queryClient: QueryClient, options?: Options<T>) {
  return useMutation((data: Variables) => updateComment(data.postId, data.commentId, data.comment), {
    onMutate: (data) => {
      // Inversion of control. If consumer wants to handle the mutation, they can pass the onMutate option.
      if (options?.onMutate) {
        return options.onMutate(data);
      }

      queryClient.cancelQueries(["comments", data.postId]);
      const previousComments = queryClient.getQueryData<InfiniteData<GetPostCommentsResponse>>([
        "comments",
        data.postId,
      ]);

      queryClient.setQueryData<InfiniteData<GetPostCommentsResponse>>(
        ["comments", data.postId],
        (oldData) => ({
          ...(oldData as InfiniteData<GetPostCommentsResponse>),
          pages: oldData?.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              comments: page.data.comments.map((comment) => {
                if (comment.id === data.commentId) {
                  return {
                    ...comment,
                    text: data.comment,
                    updated_at: new Date(),
                  };
                }
                return comment;
              }),
            },
          })) as GetPostCommentsResponse[],
        })
      );

      return { previousComments };
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData<InfiniteData<GetPostCommentsResponse>>(
          ["comments", variables.postId],
          context.previousComments
        );
      }
      options?.onError?.(error, variables, context);
    },
  });
}
