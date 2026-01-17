"use client";

import type { GetMeResponse } from "@votewise/client/user";
import type { TUpdateProfile } from "@votewise/schemas/user";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userClient } from "@/lib/client";
import { getMeKey } from "@/lib/constants";
import { assertResponse, renderErrorToast } from "@/lib/error";

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  const queryKey = getMeKey();
  const mutation = useMutation({
    mutationFn: async (data: TUpdateProfile) => assertResponse(await userClient.update(data)),
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey });
      const previousProfile = qc.getQueryData<GetMeResponse>(queryKey);
      qc.setQueryData<GetMeResponse>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          first_name: variables.first_name,
          last_name: variables.last_name,
          about: variables.about,
          cover_image_url: variables.cover,
          avatar_url: variables.avatar
        } as GetMeResponse;
      });
      return { previousProfile };
    },
    onError: (err, __, context) => {
      renderErrorToast(err);
      qc.setQueryData<GetMeResponse>(queryKey, context?.previousProfile);
    }
  });
  return mutation;
}
