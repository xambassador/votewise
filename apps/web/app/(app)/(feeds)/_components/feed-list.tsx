"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";

import { useFetchFeeds } from "@/hooks/use-fetch-feeds";

import { PAGINATION } from "@votewise/constant";
import { Error } from "@votewise/ui/error";

import { FeedMolecule } from "@/components/feed";
import { FeedListSkeleton, FeedSkeleton } from "@/components/feed-skeleton";
import { InView } from "@/components/in-view";

export function FeedList(props: { feeds: GetAllFeedsResponse }) {
  const { feeds } = props;
  const { data, status, error, fetchNextPage, nextPageStatus } = useFetchFeeds({ initialData: feeds });

  function handleInView(inView: boolean) {
    if (!inView) return;
    if (nextPageStatus === "loading") return;
    if (!data) return;
    if (!data.pagination.cursor) return;
    fetchNextPage(data.pagination.cursor);
  }

  switch (status) {
    case "pending":
      return <FeedListSkeleton />;
    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  if (!data) {
    return <Error error="No data available!!" />;
  }

  return (
    <div className="flex flex-col gap-5">
      {data.feeds.map((feed) => (
        <FeedMolecule data={feed} key={feed.id} />
      ))}
      {nextPageStatus === "loading" &&
        Array.from({ length: PAGINATION.feeds.limit }).map((_, i) => <FeedSkeleton key={i} />)}
      <InView onInView={handleInView} />
    </div>
  );
}
