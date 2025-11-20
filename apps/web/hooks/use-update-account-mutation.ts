"use client";

import type { TUpdateAccount } from "@votewise/schemas/user";

import { useMutation } from "@tanstack/react-query";

import { userClient } from "@/lib/client";

export function useUpdateAccountMutation() {
  const mutation = useMutation({
    mutationFn: async (data: TUpdateAccount) => {
      const res = await userClient.updateAccount(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    }
  });
  return mutation;
}
