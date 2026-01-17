"use client";

import type { GetUserProfileResponse } from "@votewise/client/user";

import { useQuery } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getUserProfileKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchProfile(username: string, initialData?: GetUserProfileResponse) {
  const query = useQuery({
    queryKey: getUserProfileKey(username),
    initialData,
    queryFn: async () => assertResponse(await userClient.getUser(username))
  });
  return query;
}
