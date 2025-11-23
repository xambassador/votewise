import type { GetAllFeedsResponse, GetFeedResponse } from "@votewise/client/feed";
import type { GetHotFeedsResponse, GetHotUsersResponse } from "@votewise/client/trending";
import type { GetUserRecommendationsResponse } from "@votewise/client/user";

import { notFound } from "next/navigation";

import { ERROR_CODES } from "@votewise/constant";
import { Error } from "@votewise/ui/error";

import { getFeedClient, getTrendingClient, getUserClient } from "@/lib/client.server";

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
  children: (feed: GetFeedResponse) => React.ReactNode;
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

type HotFeedFetcherProps = {
  children: (feed: GetHotFeedsResponse) => React.ReactNode;
};

export async function HotFeedFetcher(props: HotFeedFetcherProps) {
  const { children } = props;
  const client = getTrendingClient();
  const res = await client.getFeeds();
  if (!res.success) {
    return <Error error={res.error} />;
  }
  return <>{children(res.data)}</>;
}

type HotUsersFetcherProps = {
  children: (feed: GetHotUsersResponse) => React.ReactNode;
};

export async function HotUsersFetcher(props: HotUsersFetcherProps) {
  const { children } = props;
  const client = getTrendingClient();
  const res = await client.getUsers();
  if (!res.success) {
    return <Error error={res.error} />;
  }
  return <>{children(res.data)}</>;
}

type SuggestedUsersFetcherProps = {
  children: (feed: GetUserRecommendationsResponse) => React.ReactNode;
};

export async function SuggestedUsersFetcher(props: SuggestedUsersFetcherProps) {
  const { children } = props;
  const client = getUserClient();
  const res = await client.getRecommendateUsers({ top_n: 50 });
  if (!res.success) {
    return <Error error={res.error} />;
  }
  return <>{children(res.data)}</>;
}
