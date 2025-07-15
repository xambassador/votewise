"use client";

import type { AsyncState } from "@votewise/types";

import { useState } from "react";

import { makeToast } from "@votewise/ui/toast";

import { followClient } from "@/lib/client";

export function useFollowUser(username: string) {
  const [status, setStatus] = useState<AsyncState>("idle");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const isLoading = status === "loading";

  async function follow() {
    setStatus("loading");
    const res = await followClient.follow(username);
    if (!res.success) {
      makeToast.error("Oops!!", res.error);
      setStatus("error");
      return;
    }
    setIsFollowing(true);
    setStatus("success");
  }

  return { isFollowing, follow, isLoading };
}
