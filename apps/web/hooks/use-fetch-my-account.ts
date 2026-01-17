"use client";

import type { GetMyAccountResponse } from "@votewise/client/user";

import { useQuery } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getMyAccountKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchMyAccount(data?: GetMyAccountResponse) {
  const query = useQuery({
    queryKey: getMyAccountKey(),
    queryFn: async () => assertResponse(await userClient.getMyAccount()),
    initialData: data
  });
  return query;
}
