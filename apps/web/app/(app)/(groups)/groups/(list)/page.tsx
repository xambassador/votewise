import { GroupFetcher } from "../_components/group-fetcher";
import { GroupList } from "../_components/group-list";

export default function Page() {
  return <GroupFetcher>{(res) => <GroupList groups={res} />}</GroupFetcher>;
}
