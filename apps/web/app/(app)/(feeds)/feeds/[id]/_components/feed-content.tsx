"use client";

import type { GetFeedResponse } from "@votewise/client/feed";

import Link from "next/link";
import { useFetchFeed } from "@/hooks/use-fetch-feed";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  FeedContent as _FeedContent,
  FeedContentTags,
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
import { Spinner } from "@votewise/ui/ring-spinner";

import { routes } from "@/lib/routes";

import { FeedAssets } from "./feed-assets";
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
      return (
        <div className="content-height center">
          <Spinner />
        </div>
      );

    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  return (
    <>
      <FeedHeader>
        <Link href={routes.user.profile(feed.author.id)} className="focus-visible">
          <Avatar className="size-12">
            <AvatarFallback name={feed.author.first_name + " " + feed.author.last_name} />
            <AvatarImage
              src={feed.author.avatar_url || ""}
              alt={feed.author.first_name + " " + feed.author.last_name}
              className="object-cover overflow-clip-margin-unset"
            />
          </Avatar>
        </Link>
        <div className="flex gap-3">
          <div className="flex flex-col">
            <Link href={routes.user.profile(feed.author.id)} className="focus-visible">
              <FeedUserName>{feed.author.first_name + " " + feed.author.last_name}</FeedUserName>
            </Link>
            <Link href={routes.user.profile(feed.author.id)} className="focus-visible">
              <FeedUserHandle>@{feed.author.user_name}</FeedUserHandle>
            </Link>
          </div>
          <FeedTimeAgo className="pt-1">{dayjs(feed.created_at).fromNow()}</FeedTimeAgo>
        </div>
      </FeedHeader>
      <FeedTitle className="pb-4 border-b border-nobelBlack-200">{feed.title}</FeedTitle>
      <_FeedContent className="pb-7 border-b border-nobelBlack-200">
        <FeedContentText className="text-base font-normal text-gray-200">{feed.content}</FeedContentText>
        <FeedContentTags>#programming #startups</FeedContentTags>
        {feed.assets.length > 0 ? <FeedAssets assets={feed.assets} /> : null}
      </_FeedContent>

      <div className="flex flex-col gap-8 pb-4 border-b border-nobelBlack-200">
        <VoteButton is_voted={feed.is_voted} upvote_count={feed.upvote_count} feedId={feed.id} />
        {feed.voters.length > 0 && (
          <VotersStack>
            <span className="text-sm text-black-200 inline-block mr-3">Voters:</span>
            <Voters>
              {feed.voters.map((voter) => (
                <Avatar className="size-8" key={voter.id}>
                  <AvatarFallback name="Jane Smith" />
                  <AvatarImage
                    src={voter.avatar_url || ""}
                    alt="Voter"
                    className="object-cover overflow-clip-margin-unset"
                  />
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
