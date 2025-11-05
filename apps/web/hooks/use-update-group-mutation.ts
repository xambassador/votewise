"use client";

import type { GetGroupResponse } from "@votewise/client/group";
import type { TGroupUpdate } from "@votewise/schemas/group";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupKey, getGroupsKey, getMyGroupsKey } from "@/lib/constants";

const myGroupsKey = getMyGroupsKey();
const groupsKey = getGroupsKey();

export function useUpdateGroupMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: TGroupUpdate & { id: string }) => {
      const { id, ...rest } = data;
      const res = await groupClient.update(id, rest);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onMutate: async (variables) => {
      const queryKey = getGroupKey(variables.id);
      await queryClient.cancelQueries({ queryKey });
      const previousGroup = queryClient.getQueryData<GetGroupResponse>(queryKey);
      queryClient.setQueryData<GetGroupResponse>(queryKey, (oldGroup) => {
        if (!oldGroup) return oldGroup;
        return {
          ...oldGroup,
          name: variables.name,
          about: variables.description,
          type: variables.type,
          status: variables.status,
          logo_url: variables.logo_url,
          cover_url: variables.cover_image_url
        } as GetGroupResponse;
      });
      return { previousGroup };
    },
    onError: (_, variables, context) => {
      const queryKey = getGroupKey(variables.id);
      queryClient.setQueryData<GetGroupResponse>(queryKey, context?.previousGroup);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: myGroupsKey });
      queryClient.invalidateQueries({ queryKey: groupsKey });
    }
  });
  return mutation;
}
