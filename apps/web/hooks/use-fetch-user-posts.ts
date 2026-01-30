"use client";

import type { GetUserPostsResponse } from "@votewise/client/user";

import { useInfiniteQuery } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserPostsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

type Params = {
  username: string;
  type?: "posts" | "voted";
  initialData?: GetUserPostsResponse;
};

export function useFetchUserPosts(params: Params) {
  const queryKey = getUserPostsKey(params.username, params.type || "posts");

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) =>
      assertResponse(await userClient.getUserPosts(params.username, { type: params.type, cursor: pageParam })),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.cursor ?? undefined,
    initialData: params.initialData
      ? {
          pages: [params.initialData],
          pageParams: [undefined]
        }
      : undefined,
    refetchOnWindowFocus: false
  });

  const posts = query.data?.pages.flatMap((page) => page.posts) ?? [];

  return {
    ...query,
    posts
  };
}
