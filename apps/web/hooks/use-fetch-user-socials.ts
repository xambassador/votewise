"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserFollowersKey, getUserFollowingKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchUserFollowers(props: { username: string }) {
  const queryKey = getUserFollowersKey(props.username);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) =>
      assertResponse(await userClient.getUserFollowers(props.username, { cursor: pageParam })),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.cursor ?? undefined,
    refetchOnWindowFocus: false
  });

  const followers = query.data?.pages.flatMap((page) => page.followers) ?? [];

  return {
    ...query,
    followers
  };
}

export function usePrefetchUserFollowers(props: { username: string }) {
  const queryKey = getUserFollowersKey(props.username);
  const qc = useQueryClient();

  return () => {
    // @ts-expect-error @fixme
    qc.prefetchInfiniteQuery({
      queryKey,
      queryFn: async () => assertResponse(await userClient.getUserFollowers(props.username))
    });
  };
}

export function useFetchUserFollowings(props: { username: string }) {
  const queryKey = getUserFollowingKey(props.username);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) =>
      assertResponse(await userClient.getUserFollowings(props.username, { cursor: pageParam })),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.cursor ?? undefined,
    refetchOnWindowFocus: false
  });

  const following = query.data?.pages.flatMap((page) => page.following) ?? [];

  return {
    ...query,
    following
  };
}

export function usePrefetchUserFollowings(props: { username: string }) {
  const queryKey = getUserFollowingKey(props.username);
  const qc = useQueryClient();
  return () => {
    // @ts-expect-error @fixme
    qc.prefetchInfiniteQuery({
      queryKey,
      queryFn: async () => assertResponse(await userClient.getUserFollowings(props.username))
    });
  };
}
