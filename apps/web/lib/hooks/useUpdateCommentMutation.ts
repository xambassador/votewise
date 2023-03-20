import { useMutation } from "react-query";
import type { InfiniteData, QueryClient } from "react-query";

import type { GetPostCommentsResponse, UpdateCommentResponse } from "@votewise/types";

import { updateComment } from "services/post";

type Variables = {
  postId: number;
  commentId: number;
  comment: string;
};

type Options = {
  onSuccess?: (data: UpdateCommentResponse, variables: Variables, context: unknown) => void;
  onError?: (error: any, variables: Variables, context: unknown) => void;
};

export function useUpdateCommentMutation(queryClient: QueryClient, options?: Options) {
  return useMutation((data: Variables) => updateComment(data.postId, data.commentId, data.comment), {
    onMutate: (data) => {
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
