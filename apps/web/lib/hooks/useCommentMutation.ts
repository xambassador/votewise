import type { CreateCommentResponse } from "@votewise/types";
import type { User } from "lib/store";
import type { QueryClient } from "react-query";

import { useMutation } from "react-query";
import { commentOnPost } from "services/post";

type Options = {
  onSuccess?: (data: CreateCommentResponse, variables: number, context: unknown) => void;
  onError?: (error: any, variables: number, context: unknown) => void;
};

/**
 * @description This hook is used to mutate the post data when user comments on a post
 * @param comment Comment text
 * @param queryClient QueryClient instance
 * @param user Current logged in user. Get it from store
 * @param options
 * @returns
 */
export function useCommentMutation(comment: string, queryClient: QueryClient, user: User, options: Options) {
  return useMutation((postId: number) => commentOnPost(postId, comment), {
    // TODO: Can we do optimistic update here, On infinite query???
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["comments", variables]);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error: any, postId, context) => {
      options.onError?.(error, postId, context);
    },
  });
}
