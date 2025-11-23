"use client";

import type { GetHotFeedsResponse } from "@votewise/client/trending";

import { useFetchHotFeeds } from "@/hooks/use-fetch-hot-feeds";

import { Button } from "@votewise/ui/button";
import { Error } from "@votewise/ui/error";
import { ChevronDownTiny } from "@votewise/ui/icons/chevron-down-tiny";

import { FeedMolecule } from "@/components/feed";

import { HotFeedsSkeleton } from "./skeleton";

type Props = { data: GetHotFeedsResponse };

export function HotFeeds(props: Props) {
  const { data: initialData } = props;
  const { data, status, error, fetchNextPage, nextPageStatus } = useFetchHotFeeds({ initialData });

  function onLoadMore() {
    if (nextPageStatus === "loading") return;
    if (!data) return;
    if (!data.pagination.cursor) return;
    fetchNextPage(data.pagination.cursor);
  }

  switch (status) {
    case "pending":
      return <HotFeedsSkeleton />;
    case "error":
      return <Error error={error.message} />;
  }

  return (
    <div className="space-y-4">
      {data.feeds.map((feed) => (
        <FeedMolecule key={feed.id} data={feed} />
      ))}
      <Button variant="secondary" className="w-full" onClick={onLoadMore} loading={nextPageStatus === "loading"}>
        Load more trending posts
        <ChevronDownTiny />
      </Button>
    </div>
  );
}
