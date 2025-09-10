"use client";

import type { TGroupCreate } from "@votewise/schemas/group";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { groupClient, uploadClient } from "@/lib/client";
import { getMyGroupsKey } from "@/lib/constants";

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();
  const queryKey = getMyGroupsKey();
  const mutation = useMutation({
    mutationFn: async (data: TGroupCreate & { coverImageFile?: File | null }) => {
      let coverImageUrl: string | undefined;
      if (data.coverImageFile) {
        const uploadRes = await uploadClient.upload(data.coverImageFile);
        if (!uploadRes.success) {
          throw new Error(uploadRes.error);
        }
        coverImageUrl = uploadRes.data.url;
      }

      const res = await groupClient.create(coverImageUrl ? { ...data, cover_image_url: coverImageUrl } : data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });
  return mutation;
}
