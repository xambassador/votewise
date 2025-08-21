import { Suspense } from "react";
import { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Feed } from "@votewise/ui/cards/feed";
import { Error } from "@votewise/ui/error";
import { ErrorBoundary } from "@votewise/ui/error-boundary";

import { FeedFetcher } from "@/app/(app)/(feeds)/_components/feed-fetcher";

import { getCommentClient } from "@/lib/client.server";

import { DiscussionPanel } from "./_components/discussion-panel";
import { FeedContent } from "./_components/feed-content";
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
          <FeedContent feed={feed} />
          <Suspense fallback={<CommentsFetcherFallback />}>
            <CommentsFetcher id={props.params.id} />
          </Suspense>
        </Feed>
      )}
    </FeedFetcher>
  );
}

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
