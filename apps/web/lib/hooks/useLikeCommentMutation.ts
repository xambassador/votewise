import type { GetPostCommentsResponse, LikeCommentResponse } from "@votewise/types";
import type { User } from "lib/store";
import type { InfiniteData, QueryClient } from "react-query";

import { useMutation } from "react-query";
import { likeComment } from "services/post";

type Variables = {
  postId: number;
  commentId: number;
  user: User;
};

type Options<T> = {
  onMutate?: (data: Variables) => {
    previousComments: InfiniteData<GetPostCommentsResponse> | undefined;
    [key: string]: T | any;
  };
  onSuccess?: (data: LikeCommentResponse, variables: Variables, context: unknown) => void;
  onError?: (
    error: any,
    variables: Variables,
    context:
      | {
          previousComments: InfiniteData<GetPostCommentsResponse> | undefined;
          [key: string]: T | any;
        }
      | undefined
  ) => void;
};

/**
 * @description Hook for liking a comment
 * @param queryClient QueryClient instance
 * @param options Options
 * @returns
 */
export function useLikeCommentMutation<T>(queryClient: QueryClient, options?: Options<T>) {
  return useMutation((data: Variables) => likeComment(data.postId, data.commentId), {
    onMutate: (data: Variables) => {
      if (options?.onMutate) {
        return options.onMutate(data);
      }

      // Optimistically update to the new value. Only updating comments query. Not replies query.
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
            comments: page.data.comments.map((comment) => {
              if (comment.id === data.commentId) {
                return {
                  ...comment,
                  upvotes_count: comment.upvotes_count + 1,
                  upvotes: [{ id: 121, user_id: data.user.id }],
                };
              }
              return comment;
            }),
          },
        })) as GetPostCommentsResponse[],
      }));

      return { previousComments };
    },
    onSuccess: (data, variables, context) => {
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options?.onError) {
        options.onError(error, variables, context);
      }
      if (context?.previousComments) {
        queryClient.setQueryData<InfiniteData<GetPostCommentsResponse>>(
          ["comments", variables.postId],
          context.previousComments
        );
      }
    },
  });
}
