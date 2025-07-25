import { Suspense } from "react";

import { MyGroupsFetcher } from "./_components/group-fetcher";
import { MyGroupsList } from "./_components/group-list";
import Loading from "./loading";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MyGroupsFetcher>{(res) => <MyGroupsList groups={res} />}</MyGroupsFetcher>
    </Suspense>
  );
}
