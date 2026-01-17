"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupKey, getMembersKey } from "@/lib/constants";
import { assertResponse, kindOfError } from "@/lib/error";

export function useJoinGroup(groupId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => assertResponse(await groupClient.join(groupId)),
    onSettled: (_, err) => {
      if (kindOfError(err).isSandbox) return;
      queryClient.invalidateQueries({ queryKey: getGroupKey(groupId) });
      queryClient.invalidateQueries({ queryKey: getMembersKey(groupId) });
    }
  });
  return mutation;
}
