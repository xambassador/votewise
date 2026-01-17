"use client";

import type { GetFeedResponse } from "@votewise/client/feed";
import type { VoteButtonProps } from "@votewise/ui/vote-button";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useMe } from "@/components/user-provider";

import { chain } from "@/lib/chain";
import { feedClient } from "@/lib/client";
import { getFeedKey } from "@/lib/constants";
import { assertResponse, kindOfError } from "@/lib/error";

type Props = { feedId: string };

export function useVote(props: Props) {
  const { feedId } = props;
  const queryKey = getFeedKey(feedId);
  const queryClient = useQueryClient();
  const me = useMe("useVote");
  const canVote = me.votes_left > 0;

  const mutation = useMutation({
    mutationFn: async () => assertResponse(await feedClient.vote(feedId)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousFeed = queryClient.getQueryData<GetFeedResponse>(queryKey);
      queryClient.setQueryData<GetFeedResponse>(queryKey, (oldFeed) => {
        if (!oldFeed) return oldFeed;
        if (oldFeed.voters.length < 10) {
          return {
            ...oldFeed,
            is_voted: true,
            upvote_count: oldFeed.upvote_count + 1,
            voters: [...oldFeed.voters, { avatar_url: me.avatar_url, id: me.id }]
          };
        }
        return {
          ...oldFeed,
          is_voted: true,
          upvote_count: oldFeed.upvote_count + 1
        };
      });
      return { previousFeed };
    },
    onError: (err, __, ctx) => {
      if (kindOfError(err).isSandbox) return;
      queryClient.setQueryData<GetFeedResponse>(queryKey, ctx?.previousFeed);
    }
  });

  function getButtonProps(props?: VoteButtonProps): VoteButtonProps {
    return {
      showCount: true,
      ...props,
      children: canVote ? props?.children : "You have no votes left for today",
      onClick: chain(mutation.mutate, props?.onClick),
      loading: mutation.isPending,
      disabled: !canVote || mutation.isPending
    };
  }

  return { ...mutation, getButtonProps };
}
