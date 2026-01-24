"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";

import { useFetchFeeds } from "@/hooks/use-fetch-feeds";

import { PAGINATION } from "@votewise/constant";
import { Error } from "@votewise/ui/error";

import { FeedMolecule } from "@/components/feed";
import { FeedListSkeleton, FeedSkeleton } from "@/components/feed-skeleton";
import { InView } from "@/components/in-view";

export function FeedList(props: { feeds: GetAllFeedsResponse }) {
  const { feeds: initialFeeds } = props;
  const { feeds, status, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchFeeds({
    initialData: initialFeeds
  });

  function handleInView(inView: boolean) {
    if (!inView) return;
    if (isFetchingNextPage) return;
    if (!hasNextPage) return;
    fetchNextPage();
  }

  switch (status) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error Hmm.. React query thinking status can never be in "pending" due to initialData
    case "pending":
      return <FeedListSkeleton />;
    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  if (!feeds.length) {
    return <Error error="No data available!!" />;
  }

  return (
    <div className="flex flex-col gap-5">
      {feeds.map((feed) => (
        <FeedMolecule data={feed} key={feed.id} isOptimistic={"is_optimistic" in feed && !!feed.is_optimistic} />
      ))}
      {isFetchingNextPage && Array.from({ length: PAGINATION.feeds.limit }).map((_, i) => <FeedSkeleton key={i} />)}
      <InView onInView={handleInView} />
    </div>
  );
}
