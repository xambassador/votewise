"use client";

import type { GetMeResponse } from "@votewise/client/user";

import { useQuery } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getMeKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

export function useFetchMe(props?: { initialData?: GetMeResponse }) {
  const query = useQuery({
    queryKey: getMeKey(),
    queryFn: async () => assertResponse(await userClient.getMe()),
    initialData: props?.initialData
  });
  return query;
}
