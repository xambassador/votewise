"use client";

import type { GetMyGroupsResponse } from "@votewise/client/group";

import Link from "next/link";
import { useFetchMyGroups } from "@/hooks/use-fetch-my-groups";

import { Error } from "@votewise/ui/error";

import { GroupMolecule } from "@/components/group";
import { InView } from "@/components/in-view";
import { LoadMoreSpinner } from "@/components/load-more-spinner";

import { routes } from "@/lib/routes";

import Loading from "../loading";

type Props = { groups: GetMyGroupsResponse };

export function MyGroupsList(props: Props) {
  const { groups: initialData } = props;
  const { groups, status, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchMyGroups({
    initialData
  });

  function handleLoadMore(inView: boolean) {
    if (!inView) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    fetchNextPage();
  }

  switch (status) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    case "pending":
      return <Loading />;
    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  if (groups.length === 0) {
    return <NoGroups />;
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

function NoGroups() {
  return (
    <div className="content-height center">
      <div className="flex flex-col gap-5 items-center">
        <h2 className="text-black-200 text-lg text-center">
          Your ideas are lonely! Give them some friends.
          <br />
          start a group or join fellow thinkers.
        </h2>
        <p className="text-black-200 text-sm">
          Browse around - your people are waiting{" "}
          <Link href={routes.group.root()} className="underline text-blue-500">
            here!
          </Link>
        </p>
      </div>
    </div>
  );
}
