import { Suspense } from "react";
import Link from "next/link";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  Feed,
  FeedContent,
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
import { ErrorBoundary } from "@votewise/ui/error-boundary";
import { VoteButton, VoteCount, VoteProvider } from "@votewise/ui/vote-button";

import { FeedFetcher } from "@/app/(app)/(feeds)/_components/feed-fetcher";

import { getCommentClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

import { DiscussionPanel } from "./_components/discussion-panel";
import { FeedAssets } from "./_components/feed-assets";
import { CommentsFetcherFallback } from "./_components/skeleton";

extend(relativeTime);

type Props = {
  params: { id: string };
};

export default function Page(props: Props) {
  return (
    <FeedFetcher id={props.params.id}>
      {(feed) => (
        <Feed className="gap-5 flex-col">
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
          <FeedContent className="pb-7 border-b border-nobelBlack-200">
            <FeedContentText className="text-base font-normal text-gray-200">{feed.content}</FeedContentText>
            <FeedContentTags>#programming #startups</FeedContentTags>
            {feed.assets.length > 0 ? <FeedAssets assets={feed.assets} /> : null}
          </FeedContent>

          <div className="flex flex-col gap-8 pb-4 border-b border-nobelBlack-200">
            <VoteProvider className="w-full max-w-full" count={feed.upvote_count}>
              <VoteButton className="w-full max-w-full bg-nobelBlack-50" showCount>
                <VoteCount variant="minimal" />
              </VoteButton>
            </VoteProvider>
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

          <Suspense fallback={<CommentsFetcherFallback />}>
            <CommentsFetcher id={props.params.id} />
          </Suspense>
        </Feed>
      )}
    </FeedFetcher>
  );
}

const noVotersMessage = "No voters yet... Be the first one";

async function CommentsFetcher(props: { id: string }) {
  const comment = getCommentClient();
  const commentsResult = await comment.getComments(props.id);
  if (!commentsResult.success) {
    return <Error error={commentsResult.error} />;
  }

  return (
    <ErrorBoundary>
      <DiscussionPanel id={props.id} comments={commentsResult.data} />
    </ErrorBoundary>
  );
}
