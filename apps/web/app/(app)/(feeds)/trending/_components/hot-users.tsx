"use client";

import type { GetHotUsersResponse } from "@votewise/client/trending";

import Link from "next/link";
import { useFetchHotUsers } from "@/hooks/use-fetch-hot-users";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Button } from "@votewise/ui/button";
import { Error } from "@votewise/ui/error";
import { ChevronDownTiny } from "@votewise/ui/icons/chevron-down-tiny";

import { humanizeNumber } from "@/lib/humanize";
import { routes } from "@/lib/routes";
import { getFullName } from "@/lib/string";

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
      {data.users.map((user) => (
        <Link
          key={user.id}
          href={routes.user.profile(user.user_name)}
          className="focus-visible rounded-xl block"
          role="link"
          aria-label={"View " + getFullName(user) + "'s profile"}
        >
          <div className="p-5 rounded-xl bg-nobelBlack-100 border border-nobelBlack-200">
            <div className="flex items-start gap-4">
              <Avatar className="size-12">
                <AvatarImage src={user.avatar_url} alt={getFullName(user)} />
                <AvatarFallback name={getFullName(user)} />
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-x-2 mb-1 flex-wrap">
                  <span className="text-base font-semibold text-gray-300">{getFullName(user)}</span>
                  <span className="text-gray-400 text-base">@{user.user_name}</span>
                </div>
                <p className="text-gray-300 text-base mb-4">{user.about}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-blue-300 font-bold">{humanizeNumber(user.aggregates.total_followers)}</span>
                      <span className="text-gray-400"> followers</span>
                    </div>
                    <div>
                      <span className="text-blue-300 font-bold">{humanizeNumber(user.aggregates.total_posts)}</span>
                      <span className="text-gray-400"> posts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
      <Button variant="secondary" className="w-full" onClick={onLoadMore} loading={nextPageStatus === "loading"}>
        Load more trending users
        <ChevronDownTiny />
      </Button>
    </div>
  );
}
