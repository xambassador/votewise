"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Error } from "@votewise/ui/error";

import { useFetchSearchQuery } from "@/app/(app)/(search)/search/_hooks/use-fetch-search-query";

import { routes } from "@/lib/routes";

import { SearchQueryProvider } from "../_utils/store";
import { Search, SearchContentBox, SearchHeader } from "./search";
import { SearchBox } from "./search-box";
import { SearchSkeleton } from "./skeleton";

export function SearchList() {
  return (
    <div className="flex flex-col gap-10">
      <SearchQueryProvider>
        <SearchBox />
        <SearchResults />
      </SearchQueryProvider>
    </div>
  );
}

function SearchResults() {
  const { data, isError, error, isLoading } = useFetchSearchQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SearchSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <Error error={error.message} />;
  }

  if (!data || (data.results.users.length === 0 && data.results.groups.length === 0)) {
    return (
      <div className="center h-96">
        <p className="text-base text-gray-400">No results found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data.results.users.map((user) => (
        <Search key={user.id}>
          <SearchContentBox>
            <SearchHeader>
              <Link href={routes.user.profile(user.user_name)} className="focus-presets focus-primary rounded-full">
                <Avatar className="size-12">
                  <AvatarFallback name={user.first_name + " " + user.last_name} />
                  <AvatarImage src={user.avatar} alt={user.first_name + " " + user.last_name} />
                </Avatar>
              </Link>
              <div className="flex flex-col">
                <Link href={routes.user.profile(user.user_name)} className="focus-presets focus-primary">
                  <span className="text-base text-gray-200">
                    {user.first_name} {user.last_name}
                  </span>
                </Link>
                <Link href={routes.user.profile(user.user_name)} className="focus-presets focus-primary">
                  <span className="text-sm font-medium text-gray-400">@{user.user_name}</span>
                </Link>
              </div>
            </SearchHeader>
            <p className="text-gray-400 text-sm">{user.about}</p>
          </SearchContentBox>
        </Search>
      ))}

      {data.results.groups.map((group) => (
        <Search key={group.id}>
          <SearchContentBox>
            <SearchHeader>
              <Link href={routes.group.view(group.id)} className="rounded focus-presets focus-primary">
                <Avatar className="size-12 rounded">
                  <AvatarFallback name={group.name} />
                  <AvatarImage src={group.logo_url ?? ""} alt={group.name} />
                </Avatar>
              </Link>
              <div className="flex flex-col">
                <Link href={routes.group.view(group.id)} className="focus-presets focus-primary">
                  <span className="text-base text-gray-200">{group.name}</span>
                </Link>
                {group.admin && (
                  <Link href={routes.user.profile(group.admin.user_name)} className="focus-presets focus-primary">
                    <span className="text-sm font-medium text-gray-400">by @{group.admin.user_name}</span>
                  </Link>
                )}
              </div>
            </SearchHeader>
            <p className="text-gray-400 text-sm">{group.about}</p>
          </SearchContentBox>
        </Search>
      ))}
    </div>
  );
}
