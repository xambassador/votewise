import { Suspense } from "react";

import { GroupFetcher } from "./_components/group-fetcher";
import { GroupList } from "./_components/group-list";
import Loading from "./loading";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <GroupFetcher>{(res) => <GroupList groups={res} />}</GroupFetcher>
    </Suspense>
  );
}
