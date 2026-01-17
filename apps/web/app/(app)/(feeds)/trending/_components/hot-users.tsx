"use client";

import type { GetHotUsersResponse } from "@votewise/client/trending";

import { useFetchHotUsers } from "@/hooks/use-fetch-hot-users";

import { Button } from "@votewise/ui/button";
import { Error } from "@votewise/ui/error";
import { ChevronDownTiny } from "@votewise/ui/icons/chevron-down-tiny";

import { UserCard } from "@/components/user-card";

import { HotUserSkeleton } from "./skeleton";

type Props = { data: GetHotUsersResponse };

export function HotUsers(props: Props) {
  const { data: initialData } = props;
  const { data, status, error, fetchNextPage, nextPageStatus } = useFetchHotUsers({ initialData });

  function onLoadMore() {
    if (nextPageStatus === "loading") return;
    if (!data) return;
    if (!data.pagination.cursor) return;
    fetchNextPage(data.pagination.cursor);
  }

  switch (status) {
    case "pending":
      return <HotUserSkeleton />;
    case "error":
      return <Error error={error.message} />;
  }

  return (
    <div className="space-y-4">
      {data.users.length === 0 && <p className="text-center text-sm text-gray-500">No trending users found.</p>}
      {data.users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
      {data.pagination.cursor && (
        <Button variant="secondary" className="w-full" onClick={onLoadMore} loading={nextPageStatus === "loading"}>
          Load more trending users
          <ChevronDownTiny />
        </Button>
      )}
    </div>
  );
}
