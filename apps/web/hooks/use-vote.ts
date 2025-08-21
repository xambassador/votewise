"use client";

import type { GetFeedResponse } from "@votewise/client/feed";
import type { VoteButtonProps } from "@votewise/ui/vote-button";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useMe } from "@/components/user-provider";

import { chain } from "@/lib/chain";
import { feedClient } from "@/lib/client";
import { getFeedKey } from "@/lib/constants";

type Props = { feedId: string };

export function useVote(props: Props) {
  const { feedId } = props;
  const queryKey = getFeedKey(feedId);
  const queryClient = useQueryClient();
  const me = useMe("useVote");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await feedClient.vote(feedId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousFeed = queryClient.getQueryData<GetFeedResponse>(queryKey);
      queryClient.setQueryData<GetFeedResponse>(queryKey, (oldFeed) => {
        if (!oldFeed) return oldFeed;
        return {
          ...oldFeed,
          is_voted: true,
          upvote_count: oldFeed.upvote_count + 1,
          voters: [...oldFeed.voters, { avatar_url: me.avatar_url, id: me.id }]
        };
      });
      return { previousFeed };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData<GetFeedResponse>(queryKey, ctx?.previousFeed);
    }
  });

  function getButtonProps(props?: VoteButtonProps): VoteButtonProps {
    return {
      showCount: true,
      ...props,
      onClick: chain(mutation.mutate, props?.onClick),
      loading: mutation.isPending
    };
  }

  return { ...mutation, getButtonProps };
}
