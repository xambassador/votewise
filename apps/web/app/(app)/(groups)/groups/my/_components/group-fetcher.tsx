import type { GetMyGroupsResponse } from "@votewise/client/group";

import { Error } from "@votewise/ui/error";

import { getGroupClient } from "@/lib/client.server";

type MyGroupsFetcherProps = { children: (result: GetMyGroupsResponse) => React.ReactNode };

export async function MyGroupsFetcher(props: MyGroupsFetcherProps) {
  const { children } = props;
  const group = getGroupClient();
  const groupResult = await group.getMyGroups();
  if (!groupResult.success) {
    return <Error error={groupResult.error} />;
  }
  return <>{children(groupResult.data)}</>;
}
