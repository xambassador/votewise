import type { GetGroupJoinRequestsResponse } from "@votewise/client/group";

import { Error } from "@votewise/ui/error";

import { getGroupClient } from "@/lib/client.server";

type Props = {
  children: (data: GetGroupJoinRequestsResponse) => React.ReactNode;
};

export async function GroupJoinRequestFetcher(props: Props) {
  const { children } = props;
  const client = getGroupClient();
  const res = await client.getJoinRequests();
  if (!res.success) {
    return <Error error={res.error} />;
  }
  return <>{children(res.data)}</>;
}
