"use client";

import type { GetAllGroupsResponse } from "@votewise/client/group";

import { useFetchGroups } from "@/hooks/use-fetch-groups";

import { Error } from "@votewise/ui/error";
import { Spinner } from "@votewise/ui/ring-spinner";

import { GroupMolecule } from "@/components/group";
import { InView } from "@/components/in-view";

import Loading from "../loading";

type Props = {
  groups: GetAllGroupsResponse;
};

export function GroupList(props: Props) {
  const { groups } = props;
  const { data, status, error, fetchNextPage, nextPageStatus } = useFetchGroups({ initialData: groups });

  function handleLoadMore(inView: boolean) {
    if (!inView) return;
    if (!data) return;
    if (!data.pagination.next_page) return;
    if (nextPageStatus === "loading") return;
    fetchNextPage(data.pagination.next_page);
  }

  switch (status) {
    case "pending":
      return <Loading />;
    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  if (!data) {
    return <Error error="No data received!" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.groups.map((group) => (
        <GroupMolecule key={group.id} group={group} />
      ))}
      {nextPageStatus === "loading" && (
        <div className="flex items-center justify-center">
          <Spinner className="size-5" />
        </div>
      )}
      <InView onInView={handleLoadMore} />
    </div>
  );
}
