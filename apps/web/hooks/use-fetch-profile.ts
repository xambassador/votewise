"use client";

import type { GetUserProfileResponse } from "@votewise/client/user";

import { useQuery } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserProfileKey } from "@/lib/constants";

export function useFetchProfile(username: string, initialData?: GetUserProfileResponse) {
  const query = useQuery({
    queryKey: getUserProfileKey(username),
    initialData,
    queryFn: async () => {
      const res = await userClient.getUser(username);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    }
  });
  return query;
}
