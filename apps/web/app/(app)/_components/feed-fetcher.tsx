import type { GetAllFeedsResponse } from "@votewise/client/feed";

import { Error } from "@votewise/ui/error";

import { getFeedClient } from "@/lib/client.server";

type Props = {
  children: (result: GetAllFeedsResponse) => React.ReactNode;
};

export async function FeedFetcher(props: Props) {
  const { children } = props;
  const feed = getFeedClient();
  const feedResult = await feed.get();
  if (!feedResult.success) {
    return <Error error={feedResult.error} />;
  }
  return <>{children(feedResult.data)}</>;
}
