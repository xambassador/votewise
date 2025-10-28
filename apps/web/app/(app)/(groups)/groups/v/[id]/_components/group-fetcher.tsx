import type { GetGroupFeedsResponse, GetGroupResponse } from "@votewise/client/group";

import { Error } from "@votewise/ui/error";

import { getGroupClient } from "@/lib/client.server";

type Props = { id: string; children: (data: GetGroupResponse) => React.ReactNode };

export async function GroupFetcher(props: Props) {
  const { id, children } = props;
  const client = getGroupClient();
  const response = await client.get(id);
  if (!response.success) {
    return <Error error={response.error} />;
  }
  return <>{children(response.data)}</>;
}

type FeedData = { hasAccess: true; feeds: GetGroupFeedsResponse } | { hasAccess: false };
type GroupFeedFetcherProps = { id: string; children: (data: FeedData) => React.ReactNode };

export async function GroupFeedFetcher(props: GroupFeedFetcherProps) {
  const { id, children } = props;
  const client = getGroupClient();
  const response = await client.getFeeds(id);
  if (!response.success) {
    if (response.errorData.status_code === 403) {
      return <>{children({ hasAccess: false })}</>;
    }
    return <Error error={response.error} />;
  }

  return <>{children({ hasAccess: true, feeds: response.data })}</>;
}
