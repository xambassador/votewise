import type { GetAllGroupsResponse } from "@votewise/client/group";

import { Error } from "@votewise/ui/error";

import { getGroupClient } from "@/lib/client.server";

type GroupFetcherProps = {
  children: (result: GetAllGroupsResponse) => React.ReactNode;
};

export async function GroupFetcher(props: GroupFetcherProps) {
  const { children } = props;
  const group = getGroupClient();
  const groupResult = await group.getAll();
  if (!groupResult.success) {
    return <Error error={groupResult.error} />;
  }
  return <>{children(groupResult.data)}</>;
}
