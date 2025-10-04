import { MyGroupsFetcher } from "./_components/group-fetcher";
import { MyGroupsList } from "./_components/group-list";

export default function Page() {
  return <MyGroupsFetcher>{(res) => <MyGroupsList groups={res} />}</MyGroupsFetcher>;
}
