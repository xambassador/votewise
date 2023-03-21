import { useMutation } from "react-query";
import type { InfiniteData, QueryClient } from "react-query";

import type { DeleteCommentResponse, GetPostCommentsResponse } from "@votewise/types";

import { deleteComment } from "services/post";

type Variables = {
  postId: number;
  commentId: number;
};

type Options<T> = {
  onMutate?: (data: Variables) => {
    previousComments?: InfiniteData<GetPostCommentsResponse> | undefined;
    previousData?: InfiniteData<T> | undefined;
    [key: string]: T | any;
  };
  onSuccess?: (data: DeleteCommentResponse, variables: Variables, context: unknown) => void;
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
 * @description This hook is used to mutate the post data when user deletes a comment
 * Only handle optimistic update for comments.
 * @param queryClient QueryClient instance
 * @param options Options
 * @returns
 */
export function useDeleteCommentMutation<T>(queryClient: QueryClient, options?: Options<T>) {
  return useMutation((data: Variables) => deleteComment(data.postId, data.commentId), {
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

      queryClient.setQueryData<InfiniteData<GetPostCommentsResponse>>(["comments", data.postId], (old) => ({
        ...(old as InfiniteData<GetPostCommentsResponse>),
        pages: old?.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            comments: page.data.comments.filter((comment) => comment.id !== data.commentId),
          },
        })) as GetPostCommentsResponse[],
      }));

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
