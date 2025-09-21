import { GroupJoinRequestsList } from "../_components/group-join-requests-list";
import { GroupJoinRequestFetcher } from "../_components/group-notifications-fetcher";

export default async function Page() {
  return <GroupJoinRequestFetcher>{(data) => <GroupJoinRequestsList joinRequests={data} />}</GroupJoinRequestFetcher>;
}
