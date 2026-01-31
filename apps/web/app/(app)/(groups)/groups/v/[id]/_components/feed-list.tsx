"use client";

import type { GetGroupFeedsResponse } from "@votewise/client/group";

import { useFetchGroupFeeds } from "@/hooks/use-fetch-group-feeds";

import { PAGINATION } from "@votewise/constant";
import { Error } from "@votewise/ui/error";

import { FeedMolecule } from "@/components/feed";
import { FeedListSkeleton, FeedSkeleton } from "@/components/feed-skeleton";
import { InView } from "@/components/in-view";

export function GroupFeedList(props: { feeds: GetGroupFeedsResponse; groupId: string }) {
  const { feeds: initialData, groupId } = props;
  const { data, feeds, status, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchGroupFeeds(groupId, {
    initialData
  });

  function handleInView(inView: boolean) {
    if (!inView) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    fetchNextPage();
  }

  switch (status) {
    case "pending":
      return <FeedListSkeleton className="mt-5" />;
    case "error":
      return (
        <Error
          error={error?.message ?? "Unknown error"}
          errorInfo={error?.stack ? { componentStack: error.stack } : undefined}
        />
      );
  }

  if (!data) {
    return <Error error="No data available!!" />;
  }

  return (
    <div className="flex flex-col gap-5 mt-5">
      {feeds.map((feed) => (
        <FeedMolecule data={feed} key={feed.id} />
      ))}
      {isFetchingNextPage && Array.from({ length: PAGINATION.feeds.limit }).map((_, i) => <FeedSkeleton key={i} />)}
      <InView onInView={handleInView} />
    </div>
  );
}
