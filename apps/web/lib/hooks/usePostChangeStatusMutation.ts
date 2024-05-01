import type { GetMyPostsResponse, UpdatePostStatusResponse } from "@votewise/types";
import type { InfiniteData, QueryClient } from "react-query";

import { useMutation } from "react-query";
import { updatePostStatus } from "services/user";

type Status = "open" | "closed" | "archived" | "inprogress";
type OrderBy = "asc" | "desc";

type Variables = {
  postId: number;
  status: Status;
  orderBy: OrderBy;
};

type Options = {
  onSuccess?: (data: UpdatePostStatusResponse, variables: Variables, context: unknown) => void;
  onError?: (error: any, variables: Variables, context: unknown) => void;
};

export function usePostChangeStatusMutation(
  postStatus: Status,
  orderBy: OrderBy,
  queryClient: QueryClient,
  options?: Options
) {
  return useMutation((data: Variables) => updatePostStatus(data.postId, data.status), {
    onMutate: (variables) => {
      const key = ["my-posts", postStatus, orderBy];
      queryClient.cancelQueries(key);
      const previousPosts = queryClient.getQueryData<InfiniteData<GetMyPostsResponse>>(key);

      queryClient.setQueryData<InfiniteData<GetMyPostsResponse>>(key, (old) => ({
        ...(old as InfiniteData<GetMyPostsResponse>),
        pages: old?.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            posts: page.data.posts.map((post) => {
              if (post.id === variables.postId) {
                return {
                  ...post,
                  status: variables.status.toUpperCase(),
                  updated_at: new Date(),
                };
              }
              return post;
            }),
          },
        })) as GetMyPostsResponse[],
      }));

      return { previousPosts };
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    onSettled: () => {
      const key = ["my-posts", postStatus, orderBy];
      queryClient.invalidateQueries(key);
    },
  });
}
