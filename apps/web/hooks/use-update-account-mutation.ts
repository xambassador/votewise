"use client";

import type { TUpdateAccount } from "@votewise/schemas/user";

import { useMutation } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { assertResponse, renderErrorToast } from "@/lib/error";

export function useUpdateAccountMutation() {
  const mutation = useMutation({
    mutationFn: async (data: TUpdateAccount) => assertResponse(await userClient.updateAccount(data)),
    onError: (err) => renderErrorToast(err)
  });
  return mutation;
}
