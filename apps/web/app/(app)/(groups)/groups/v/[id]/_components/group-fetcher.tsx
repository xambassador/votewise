import type { GetGroupResponse } from "@votewise/client/group";

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
