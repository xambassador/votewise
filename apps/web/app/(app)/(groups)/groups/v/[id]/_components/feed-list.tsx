"use client";

import type { GetGroupFeedsResponse } from "@votewise/client/group";

import { useFetchGroupFeeds } from "@/hooks/use-fetch-group-feeds";

import { Error } from "@votewise/ui/error";

import { FeedMolecule } from "@/components/feed";
import { FeedListSkeleton, FeedSkeleton } from "@/components/feed-skeleton";
import { InView } from "@/components/in-view";

export function GroupFeedList(props: { feeds: GetGroupFeedsResponse; groupId: string }) {
  const { feeds, groupId } = props;
  const { data, status, error, fetchNextPage, nextPageStatus } = useFetchGroupFeeds(groupId, { initialData: feeds });

  function handleInView(inView: boolean) {
    if (!inView) return;
    if (nextPageStatus === "loading") return;
    if (!data) return;
    if (!data.pagination.cursor) return;
    fetchNextPage(data.pagination.cursor);
  }

  switch (status) {
    case "pending":
      return <FeedListSkeleton className="mt-5" />;
    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  if (!data) {
    return <Error error="No data available!!" />;
  }

  return (
    <div className="flex flex-col gap-5 mt-5">
      {data.feeds.map((feed) => (
        <FeedMolecule data={feed} key={feed.id} />
      ))}
      {nextPageStatus === "loading" && Array.from({ length: 5 }).map((_, i) => <FeedSkeleton key={i} />)}
      <InView onInView={handleInView} />
    </div>
  );
}
