import { Suspense } from "react";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { CommentInput, CommentList, Comments } from "@votewise/ui/cards/comment";
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
import { ZigZagList } from "@votewise/ui/image-card";
import { Spinner } from "@votewise/ui/ring-spinner";
import { VoteButton, VoteCount, VoteProvider } from "@votewise/ui/vote-button";

import { FeedFetcher } from "@/app/(app)/_components/feed-fetcher";

import { getCommentClient } from "@/lib/client.server";

import { DiscussionPanel } from "./_components/discussion-panel";

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
            <Avatar className="size-12">
              <AvatarFallback name={feed.author.first_name + " " + feed.author.last_name} />
              <AvatarImage
                src={feed.author.avatar_url || ""}
                alt={feed.author.first_name + " " + feed.author.last_name}
                className="object-cover"
              />
            </Avatar>
            <div className="flex gap-3">
              <div className="flex flex-col">
                <FeedUserName>{feed.author.first_name + " " + feed.author.last_name}</FeedUserName>
                <FeedUserHandle>@{feed.author.user_name}</FeedUserHandle>
              </div>
              <FeedTimeAgo className="pt-1">{dayjs(feed.created_at).fromNow()}</FeedTimeAgo>
            </div>
          </FeedHeader>
          <FeedTitle className="pb-4 border-b border-nobelBlack-200">{feed.title}</FeedTitle>
          <FeedContent className="pb-7 border-b border-nobelBlack-200">
            <FeedContentText className="text-base font-normal text-gray-200">{feed.content}</FeedContentText>
            <FeedContentTags>#programming #startups</FeedContentTags>
            {feed.assets.length > 0 ? (
              <ZigZagList
                images={feed.assets}
                imageCardProps={({ image }) => ({ alt: image.alt || "Feed asset" })}
                className="mt-4"
              />
            ) : null}
          </FeedContent>

          <div className="flex flex-col gap-8 pb-4 border-b border-nobelBlack-200">
            <VoteProvider className="w-full max-w-full" count={feed.upvote_count}>
              <VoteButton className="w-full max-w-full bg-nobelBlack-50" showCount>
                <VoteCount variant="minimal" />
              </VoteButton>
            </VoteProvider>
            <VotersStack>
              <span className="text-sm text-black-200 inline-block mr-3">Voters:</span>
              <Voters>
                {feed.voters.map((voter) => (
                  <Avatar className="size-8" key={voter.id}>
                    <AvatarFallback name="Jane Smith" />
                    <AvatarImage src={voter.avatar_url || ""} alt="Voter" className="object-cover" />
                  </Avatar>
                ))}
              </Voters>
              {feed.upvote_count - 10 > 0 ? <VotersCount>+{feed.upvote_count - 10}</VotersCount> : null}
            </VotersStack>
          </div>

          <Suspense fallback={commentsFetcherFallback}>
            <CommentsFetcher id={props.params.id} />
          </Suspense>
        </Feed>
      )}
    </FeedFetcher>
  );
}

const commentsFetcherFallback = (
  <Comments>
    <CommentInput disabled style={{ height: 40 }} />
    <CommentList className="min-h-28 justify-center">
      <div className="flex flex-col gap-1 items-center">
        <span className="text-sm text-gray-400">Retrieving thoughts that people typed and didn&apos;t delete...</span>
        <Spinner className="size-5" />
      </div>
    </CommentList>
  </Comments>
);

async function CommentsFetcher(props: { id: string }) {
  const comment = getCommentClient();
  const commentsResult = await comment.getComments(props.id);
  if (!commentsResult.success) {
    return <Error error={commentsResult.error} />;
  }
  return <DiscussionPanel id={props.id} comments={commentsResult.data.comments} />;
}
