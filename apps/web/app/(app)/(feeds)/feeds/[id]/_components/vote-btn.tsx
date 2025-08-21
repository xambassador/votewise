"use client";

import { useVote } from "@/hooks/use-vote";

import { VoteButton as Button, VoteCount, VoteProvider } from "@votewise/ui/vote-button";

type Props = {
  upvote_count: number;
  is_voted: boolean;
  feedId: string;
};

export function VoteButton(props: Props) {
  const { upvote_count, is_voted, feedId } = props;
  const { getButtonProps } = useVote({ feedId });
  return (
    <VoteProvider className="w-full max-w-full" count={upvote_count}>
      <Button {...getButtonProps({ className: "w-full max-w-full bg-nobelBlack-50", isVoted: is_voted })}>
        <VoteCount variant="minimal" />
      </Button>
    </VoteProvider>
  );
}
