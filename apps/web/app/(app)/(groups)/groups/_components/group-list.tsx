"use client";

import type { GetAllGroupsResponse } from "@votewise/client/group";

import { useFetchGroups } from "@/hooks/use-fetch-groups";

import { Error } from "@votewise/ui/error";

import { GroupMolecule } from "@/components/group";
import { GroupListSkeleton } from "@/components/group-skeleton";
import { InView } from "@/components/in-view";
import { LoadMoreSpinner } from "@/components/load-more-spinner";

type Props = {
  groups: GetAllGroupsResponse;
};

export function GroupList(props: Props) {
  const { groups: initialGroups } = props;
  const { groups, status, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useFetchGroups({
    initialData: initialGroups
  });

  function handleLoadMore(inView: boolean) {
    if (!inView) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    fetchNextPage();
  }

  switch (status) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - status can be pending if initialData is not provided
    case "pending":
      return <GroupListSkeleton />;
    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  if (groups.length === 0) {
    return <Error error="No data received!" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <GroupMolecule key={group.id} group={group} />
      ))}
      {isFetchingNextPage && <LoadMoreSpinner />}
      <InView onInView={handleLoadMore} />
    </div>
  );
}
