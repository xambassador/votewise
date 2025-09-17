"use client";

import { useMutation } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";

export function useJoinGroup(groupId: string) {
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await groupClient.join(groupId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    }
  });
  return mutation;
}
