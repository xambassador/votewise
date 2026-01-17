"use client";

import type { GetUserPostsResponse } from "@votewise/client/user";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserPostsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchUserPosts(props: { username: string; type?: "posts" | "voted" }) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryClient = useQueryClient();
  const queryKey = getUserPostsKey(props.username, props.type);
  const query = useQuery({
    queryKey,
    queryFn: async () => assertResponse(await userClient.getUserPosts(props.username, { type: props.type })),
    refetchOnWindowFocus: false
  });

  async function fetchNextPage() {
    setNextPageStatus("loading");
    const res = await userClient.getUserPosts(props.username, { type: props.type });
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetUserPostsResponse>(queryKey, (oldData) => {
      if (!oldData) return res.data;
      return {
        ...oldData,
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        posts: [...oldData.posts, ...res.data.posts]
      } as GetUserPostsResponse;
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}
