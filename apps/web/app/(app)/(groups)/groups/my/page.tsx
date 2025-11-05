import { Authorized } from "@/components/auth";

import { MyGroupsFetcher } from "./_components/group-fetcher";
import { MyGroupsList } from "./_components/group-list";

export default function Page() {
  return (
    <Authorized>
      <MyGroupsFetcher>{(res) => <MyGroupsList groups={res} />}</MyGroupsFetcher>
    </Authorized>
  );
}
