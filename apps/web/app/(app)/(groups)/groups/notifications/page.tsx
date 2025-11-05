import { Authorized } from "@/components/auth";

import { GroupJoinRequestsList } from "../_components/group-join-requests-list";
import { GroupJoinRequestFetcher } from "../_components/group-notifications-fetcher";

export default async function Page() {
  return (
    <Authorized>
      <GroupJoinRequestFetcher>{(data) => <GroupJoinRequestsList joinRequests={data} />}</GroupJoinRequestFetcher>
    </Authorized>
  );
}
