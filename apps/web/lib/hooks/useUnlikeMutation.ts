import { useMutation } from "react-query";
import type { QueryClient } from "react-query";

import type { GetPostResponse, UnLikePostResponse } from "@votewise/types";

import type { User } from "lib/store";

import { unlikePost } from "services/post";

type Options = {
  onSuccess?: (data: UnLikePostResponse, variables: number, context: unknown) => void;
  onError?: (error: any, variables: number, context: unknown) => void;
};

/**
 * @description This hook is used to mutate the post data when user unlikes a post
 * It handle optimistic updates and rollbacks.
 * @param queryClient QueryClient instance
 * @param user Current logged in user. Get it from store
 * @param options
 * @returns
 */
export function useUnLikeMutation(queryClient: QueryClient, user: User, options?: Options) {
  return useMutation((postId: number) => unlikePost(postId), {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    onMutate: (postId) => {
      queryClient.cancelQueries(["post", postId]);
      const previousPosts = queryClient.getQueryData(["post", postId]);
      queryClient.setQueryData<GetPostResponse>(["post", postId], (old) => ({
        ...(old as GetPostResponse),
        data: {
          ...old?.data,
          post: {
            ...old?.data.post,
            upvotes_count: old?.data ? old.data.post.upvotes_count - 1 : 0,
            upvotes: old?.data.post.upvotes.filter((upvote) => upvote.user_id !== user.id),
          },
        } as GetPostResponse["data"],
      }));

      return {
        previousPosts,
      };
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    // eslint-disable-next-line @typescript-eslint/no-shadow
    onError: (error: any, postId, context) => {
      queryClient.setQueryData(["post", postId], context?.previousPosts);
      options?.onError?.(error, postId, context);
    },
  });
}
