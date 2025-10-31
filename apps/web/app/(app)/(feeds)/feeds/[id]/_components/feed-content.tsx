"use client";

import type { GetFeedResponse } from "@votewise/client/feed";

import Link from "next/link";
import { useFetchFeed } from "@/hooks/use-fetch-feed";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  FeedContent as _FeedContent,
  FeedContentText,
  FeedHeader,
  FeedTimeAgo,
  FeedTitle,
  FeedUserHandle,
  FeedUserName,
  Voters,
  VotersCount,
  VotersStack
} from "@votewise/ui/cards/feed";
import { Error } from "@votewise/ui/error";

import { routes } from "@/lib/routes";

import { FeedAssets } from "./feed-assets";
import { FeedSkeletonShell } from "./skeleton";
import { VoteButton } from "./vote-btn";

extend(relativeTime);

type Props = {
  feed: GetFeedResponse;
};

export function FeedContent(props: Props) {
  const { feed: initialData } = props;
  const { status, error, data: feed } = useFetchFeed({ initialData, feedId: initialData.id });

  switch (status) {
    case "pending":
      return <FeedSkeletonShell />;

    case "error":
      return (
        <Error
          shellProps={{ className: "border-none shadow-none" }}
          iconWrapperProps={{ className: "bg-nobelBlack-200" }}
          error={error.message}
          errorInfo={{ componentStack: error.stack }}
        />
      );
  }

  return (
    <>
      <div className="flex items-start gap-3">
        <Link href={routes.user.profile(feed.author.user_name)} className="focus-visible rounded-full">
          <Avatar className="size-12">
            <AvatarFallback name={feed.author.first_name + " " + feed.author.last_name} />
            <AvatarImage
              src={feed.author.avatar_url || ""}
              alt={feed.author.first_name + " " + feed.author.last_name}
            />
          </Avatar>
        </Link>
        <div className="w-full">
          <FeedHeader>
            <Link href={routes.user.profile(feed.author.user_name)} className="focus-visible">
              <FeedUserName>{feed.author.first_name + " " + feed.author.last_name}</FeedUserName>
            </Link>
            <FeedTimeAgo className="pt-1">{dayjs(feed.created_at).fromNow()}</FeedTimeAgo>
          </FeedHeader>
          <FeedHeader>
            <Link href={routes.user.profile(feed.author.user_name)} className="focus-visible">
              <FeedUserHandle>@{feed.author.user_name}</FeedUserHandle>
            </Link>
          </FeedHeader>
        </div>
      </div>
      <FeedTitle className="pb-4 border-b border-nobelBlack-200">{feed.title}</FeedTitle>
      <_FeedContent className="pb-7 border-b border-nobelBlack-200">
        <FeedContentText className="text-base font-normal text-gray-200">{feed.content}</FeedContentText>
        {feed.assets.length > 0 ? <FeedAssets assets={feed.assets} /> : null}
      </_FeedContent>

      <div className="flex flex-col gap-8 pb-4 border-b border-nobelBlack-200">
        <VoteButton isVoted={feed.is_voted} upvoteCount={feed.upvote_count} feedId={feed.id} />
        {feed.voters.length > 0 && (
          <VotersStack>
            <span className="text-sm text-black-200 inline-block mr-3">Voters:</span>
            <Voters>
              {feed.voters.map((voter) => (
                <Avatar className="size-8" key={voter.id}>
                  <AvatarFallback name="Jane Smith" />
                  <AvatarImage src={voter.avatar_url || ""} alt="Voter" />
                </Avatar>
              ))}
            </Voters>
            {feed.upvote_count - 10 > 0 ? <VotersCount>+{feed.upvote_count - 10}</VotersCount> : null}
          </VotersStack>
        )}
        {feed.voters.length === 0 && <span className="text-sm text-gray-500">{noVotersMessage}</span>}
      </div>
    </>
  );
}

const noVotersMessage = "No voters yet... Be the first one";
