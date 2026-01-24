"use client";

import type { Feed } from "@/types";
import type { TFeedCreate } from "@votewise/schemas/feed";
import type { InfiniteFeedsData } from "./use-fetch-feeds";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PAGINATION } from "@votewise/constant";

import { useMe } from "@/components/user-provider";

import { feedClient } from "@/lib/client";
import { getFeedsKey, getGroupFeedsKey } from "@/lib/constants";
import { assertResponse, renderErrorToast } from "@/lib/error";
import { useActiveGroup } from "@/lib/global-store";

type Props = {
  onMutate?: () => void;
};

export function useCreateFeedMutation(props?: Props) {
  const qc = useQueryClient();
  const queryKey = getFeedsKey();
  const me = useMe("useCreateFeedMutation");
  const group = useActiveGroup();

  const mutation = useMutation({
    mutationFn: async (data: TFeedCreate) => assertResponse(await feedClient.create(data)),
    onMutate: async (variable) => {
      props?.onMutate?.();
      await qc.cancelQueries({ queryKey });
      const previousFeeds = qc.getQueryData<InfiniteFeedsData>(queryKey);
      const feedId = `optimistic-${Date.now()}`;
      qc.setQueryData<InfiniteFeedsData>(queryKey, (oldData) => {
        if (!oldData) return oldData;

        const now = new Date();
        const feed: Feed & { is_optimistic: true } = {
          id: feedId,
          title: variable.title,
          slug: "",
          created_at: now,
          updated_at: now,
          hash_tags: [],
          author: {
            id: me.id,
            user_name: me.user_name,
            first_name: me.first_name,
            last_name: me.last_name,
            avatar_url: me.avatar_url ?? ""
          },
          votes: 0,
          voters: [],
          comments: 0,
          is_optimistic: true
        };

        const newPages = [...oldData.pages];
        if (newPages.length > 0) {
          newPages[0] = {
            ...newPages[0],
            feeds: [feed, ...newPages[0].feeds]
          };
        } else {
          newPages.push({
            feeds: [feed],
            pagination: {
              current_page: 1,
              cursor: null,
              has_next_page: false,
              has_previous_page: false,
              limit: PAGINATION.feeds.limit,
              next_page: null,
              previous_page: null,
              total: 1,
              total_page: 1
            }
          });
        }

        return {
          ...oldData,
          pages: newPages
        };
      });
      return { previousFeeds, feedId };
    },
    onError: (err, _, ctx) => {
      renderErrorToast(err);
      qc.setQueryData<InfiniteFeedsData>(queryKey, (oldData) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page) => ({
          ...page,
          feeds: page.feeds.filter(
            (feed) => !((feed as Feed & { is_optimistic?: boolean }).is_optimistic && feed.id === ctx?.feedId)
          )
        }));

        return {
          ...oldData,
          pages: newPages
        };
      });
    },
    onSuccess: (data, _, ctx) => {
      qc.setQueryData<InfiniteFeedsData>(queryKey, (oldData) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page) => ({
          ...page,
          feeds: page.feeds.map((feed: Feed & { is_optimistic?: boolean }) =>
            feed.is_optimistic && feed.id === ctx?.feedId
              ? { ...feed, id: data.id, slug: data.slug, is_optimistic: undefined }
              : feed
          )
        }));

        return {
          ...oldData,
          pages: newPages
        };
      });
    },
    onSettled: () => {
      if (group) {
        qc.invalidateQueries({ queryKey: getGroupFeedsKey(group.id) });
      }
    }
  });

  return mutation;
}
