"use client";

import type { TGroupCreate } from "@votewise/schemas/group";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupsKey, getMyGroupsKey } from "@/lib/constants";

const queryKey = getMyGroupsKey();
const groupsKey = getGroupsKey();

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: TGroupCreate) => {
      const res = await groupClient.create(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: groupsKey });
    }
  });
  return mutation;
}
