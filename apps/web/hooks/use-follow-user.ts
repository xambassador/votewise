"use client";

import type { GetUserProfileResponse } from "@votewise/client/user";
import type { AsyncState } from "@votewise/types";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { makeToast } from "@votewise/ui/toast";

import { followClient } from "@/lib/client";
import { getUserProfileKey } from "@/lib/constants";

export function useFollowUser(username: string, defaultIsFollowing: boolean) {
  const [status, setStatus] = useState<AsyncState>("idle");
  const [isFollowing, setIsFollowing] = useState<boolean>(defaultIsFollowing || false);
  const queryClient = useQueryClient();
  const queryKey = getUserProfileKey(username);
  const isLoading = status === "loading";

  async function follow() {
    setStatus("loading");
    const res = await followClient.follow(username);
    if (!res.success) {
      makeToast.error("Oops!!", res.error);
      setStatus("error");
      return;
    }
    await queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData<GetUserProfileResponse>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        self_follow: true
      } as GetUserProfileResponse;
    });
    setIsFollowing(true);
    setStatus("success");
  }

  async function unFollow() {
    setStatus("loading");
    const res = await followClient.unfollow(username);
    if (!res.success) {
      makeToast.error("Oops!!", res.error);
      setStatus("error");
      return;
    }
    await queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData<GetUserProfileResponse>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        self_follow: false
      } as GetUserProfileResponse;
    });
    setIsFollowing(false);
    setStatus("success");
  }

  return { isFollowing, follow, isLoading, unFollow };
}
