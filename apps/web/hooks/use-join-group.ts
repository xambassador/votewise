"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupKey, getMembersKey } from "@/lib/constants";

export function useJoinGroup(groupId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await groupClient.join(groupId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getGroupKey(groupId) });
      queryClient.invalidateQueries({ queryKey: getMembersKey(groupId) });
    }
  });
  return mutation;
}
