"use client";

import type { GetMyAccountResponse } from "@votewise/client/user";

import { useQuery } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getMyAccountKey } from "@/lib/constants";

export function useFetchMyAccount(data?: GetMyAccountResponse) {
  const query = useQuery({
    queryKey: getMyAccountKey(),
    queryFn: async () => {
      const res = await userClient.getMyAccount();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    initialData: data
  });
  return query;
}
