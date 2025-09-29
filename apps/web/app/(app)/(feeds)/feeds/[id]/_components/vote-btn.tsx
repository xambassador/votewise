"use client";

import { useVote } from "@/hooks/use-vote";

import { VoteButton as Button, VoteCount, VoteProvider } from "@votewise/ui/vote-button";

type Props = {
  upvoteCount: number;
  isVoted: boolean;
  feedId: string;
};

export function VoteButton(props: Props) {
  const { upvoteCount, isVoted, feedId } = props;
  const { getButtonProps } = useVote({ feedId });
  return (
    <VoteProvider className="w-full max-w-full" count={upvoteCount}>
      <Button {...getButtonProps({ className: "w-full max-w-full bg-nobelBlack-50", isVoted })}>
        <VoteCount variant="minimal" />
      </Button>
    </VoteProvider>
  );
}
