"use client";

import type { GetUserFollowersResponse, GetUserFollowingsResponse } from "@votewise/client/user";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserFollowersKey, getUserFollowingKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchUserFollowers(props: { username: string }) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryClient = useQueryClient();
  const queryKey = getUserFollowersKey(props.username);
  const query = useQuery({
    queryKey,
    queryFn: async () => assertResponse(await userClient.getUserFollowers(props.username)),
    refetchOnWindowFocus: false
  });

  async function fetchNextPage() {
    setNextPageStatus("loading");
    const res = await userClient.getUserFollowers(props.username);
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetUserFollowersResponse>(queryKey, (oldData) => {
      if (!oldData) return res.data;
      return {
        ...oldData,
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        followers: [...oldData.followers, ...res.data.followers]
      } as GetUserFollowersResponse;
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}

export function useFetchUserFollowings(props: { username: string }) {
  const [nextPageStatus, setNextPageStatus] = useState<AsyncState>("idle");
  const queryClient = useQueryClient();
  const queryKey = getUserFollowingKey(props.username);
  const query = useQuery({
    queryKey,
    queryFn: async () => assertResponse(await userClient.getUserFollowings(props.username)),
    refetchOnWindowFocus: false
  });

  async function fetchNextPage() {
    setNextPageStatus("loading");
    const res = await userClient.getUserFollowings(props.username);
    if (!res.success) {
      setNextPageStatus("error");
      return;
    }
    queryClient.setQueryData<GetUserFollowingsResponse>(queryKey, (oldData) => {
      if (!oldData) return res.data;
      return {
        ...oldData,
        pagination: {
          ...oldData.pagination,
          ...res.data.pagination
        },
        following: [...oldData.following, ...res.data.following]
      } as GetUserFollowingsResponse;
    });
    setNextPageStatus("success");
  }

  return { ...query, fetchNextPage, nextPageStatus };
}
