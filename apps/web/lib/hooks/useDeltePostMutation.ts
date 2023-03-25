import type { OrderBy, PostStatus } from "types/post";

import { useMutation } from "react-query";
import type { InfiniteData, QueryClient } from "react-query";

import type { DeletePostResponse, GetMyPostsResponse } from "@votewise/types";

import { deletePost } from "services/user";

type Variables = {
  postId: number;
  orderBy: OrderBy;
  status: PostStatus;
};

type Options<T> = {
  onMutate?: (data: Variables) => {
    previousPosts?: InfiniteData<GetMyPostsResponse> | undefined;
    previousData?: InfiniteData<T> | undefined;
    [key: string]: T | any;
  };
  onSuccess?: (data: DeletePostResponse, variables: Variables, context: unknown) => void;
  onError?: (
    error: any,
    variables: Variables,
    context:
      | {
          previousPosts?: InfiniteData<GetMyPostsResponse> | undefined;
          previousData?: InfiniteData<T> | undefined;
        }
      | undefined
  ) => void;
};

/**
 * @description This hook is used to mutate the post data when user delete post.
 * @param queryClient QueryClient instance
 * @param options Options
 * @returns
 */
export function useDeletePostMutation<T>(queryClient: QueryClient, options?: Options<T>) {
  return useMutation((data: Variables) => deletePost(data.postId), {
    onMutate: (data) => {
      if (options?.onMutate) {
        return options.onMutate(data);
      }

      return {};
    },
    onSuccess: (data, variables, context) => {
      const key = ["my-posts", variables.status, variables.orderBy];
      queryClient.cancelQueries(key);
      queryClient.setQueryData<InfiniteData<GetMyPostsResponse>>(key, (old) => ({
        ...(old as InfiniteData<GetMyPostsResponse>),
        pages: old?.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            posts: page.data.posts.filter((post) => post.id !== variables.postId),
          },
        })) as GetMyPostsResponse[],
      }));
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData<InfiniteData<GetMyPostsResponse>>(
          ["my-posts", variables.status, variables.orderBy],
          context.previousPosts
        );
      }
      options?.onError?.(error, variables, context);
    },
  });
}
