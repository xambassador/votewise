import { Suspense } from "react";

import { GroupMolecule } from "@/components/group";

import { GroupFetcher } from "./_components/group-fetcher";
import Loading from "./loading";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <GroupFetcher>
        {({ groups }) => (
          <div className="grid grid-cols-2 gap-4">
            {groups.map((group) => (
              <GroupMolecule key={group.id} group={group} />
            ))}
          </div>
        )}
      </GroupFetcher>
    </Suspense>
  );
}
