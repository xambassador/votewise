import { useMutation } from "react-query";
import type { QueryClient } from "react-query";

import type { ReplyToCommentResponse } from "@votewise/types";

import { replyToComment } from "services/post";

type Variables = {
  postId: number;
  commentId: number;
  comment: string;
};

type Options = {
  onSuccess?: (data: ReplyToCommentResponse, variables: Variables, context: unknown) => void;
  onError?: (error: any, variables: Variables, context: unknown) => void;
};

/**
 * @description This hook is used to mutate the comment to add reply to a comment
 * @param comment Comment text
 * @param queryClient QueryClient instance
 * @param user Current logged in user. Get it from store
 * @param options
 * @returns
 */
export function useReplyToCommentMutation(queryClient: QueryClient, options?: Options) {
  return useMutation((data: Variables) => replyToComment(data.postId, data.commentId, data.comment), {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    // eslint-disable-next-line @typescript-eslint/no-shadow
    onError: (error: any, postId, context) => {
      options?.onError?.(error, postId, context);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries(["comments", variables.postId]);
      queryClient.invalidateQueries(["replies", variables.postId, variables.commentId]);
    },
  });
}
