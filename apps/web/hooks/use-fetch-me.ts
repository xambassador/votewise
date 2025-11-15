"use client";

import type { GetMeResponse } from "@votewise/client/user";

import { useQuery } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getMeKey } from "@/lib/constants";

export function useFetchMe(props?: { initialData?: GetMeResponse }) {
  const query = useQuery({
    queryKey: getMeKey(),
    queryFn: async () => {
      const res = await userClient.getMe();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    initialData: props?.initialData
  });
  return query;
}
