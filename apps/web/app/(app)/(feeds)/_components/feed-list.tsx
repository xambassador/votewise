"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";

import { useFetchFeeds } from "@/hooks/use-fetch-feeds";

import { Error } from "@votewise/ui/error";

import { FeedMolecule } from "@/components/feed";
import { InView } from "@/components/in-view";
import { LoadMoreSpinner } from "@/components/load-more-spinner";

import Loading from "../loading";

export function FeedList(props: { feeds: GetAllFeedsResponse }) {
  const { feeds } = props;
  const { data, status, error, fetchNextPage, nextPageStatus } = useFetchFeeds({ initialData: feeds });

  function handleInView(inView: boolean) {
    if (!inView) return;
    if (nextPageStatus === "loading") return;
    if (!data) return;
    if (!data.pagination.next_page) return;
    fetchNextPage(data.pagination.next_page);
  }

  switch (status) {
    case "pending":
      return <Loading />;
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
      {nextPageStatus === "loading" && <LoadMoreSpinner />}
      <InView onInView={handleInView} />
    </div>
  );
}
