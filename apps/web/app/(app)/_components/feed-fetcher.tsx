import type { GetAllFeedsResponse, GetFeedResponse } from "@votewise/client/feed";

import { notFound } from "next/navigation";

import { ERROR_CODES } from "@votewise/constant";
import { Error } from "@votewise/ui/error";

import { getFeedClient } from "@/lib/client.server";

type FeedListFetcherProps = {
  children: (result: GetAllFeedsResponse) => React.ReactNode;
};

export async function FeedListFetcher(props: FeedListFetcherProps) {
  const { children } = props;
  const feed = getFeedClient();
  const feedResult = await feed.getAll();
  if (!feedResult.success) {
    return <Error error={feedResult.error} />;
  }
  return <>{children(feedResult.data)}</>;
}

type FeedFetcherProps = {
  id: string;
  children: (result: GetFeedResponse) => React.ReactNode;
};

export async function FeedFetcher(props: FeedFetcherProps) {
  const { children, id } = props;
  const feed = getFeedClient();
  const feedResult = await feed.get(id);

  if (!feedResult.success && feedResult.errorData.error_code === ERROR_CODES.FEED.FEED_NOT_FOUND) {
    return notFound();
  }

  if (!feedResult.success) {
    return <Error error={feedResult.error} />;
  }

  return <>{children(feedResult.data)}</>;
}
