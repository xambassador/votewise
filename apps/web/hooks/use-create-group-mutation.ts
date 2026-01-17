"use client";

import type { TGroupCreate } from "@votewise/schemas/group";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupsKey, getMyGroupsKey } from "@/lib/constants";
import { assertResponse, kindOfError, renderErrorToast } from "@/lib/error";

const queryKey = getMyGroupsKey();
const groupsKey = getGroupsKey();

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: TGroupCreate) => assertResponse(await groupClient.create(data)),
    onError: (err) => renderErrorToast(err),
    onSettled: (_, err) => {
      if (kindOfError(err).isSandbox) return;
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: groupsKey });
    }
  });
  return mutation;
}
