import { Skeleton } from "@votewise/ui/skeleton";

import { Search, SearchContentBox, SearchHeader } from "./search";

export function SearchSkeleton() {
  return (
    <Search>
      <SearchContentBox>
        <SearchHeader>
          <Skeleton className="size-12 rounded-full min-w-12" />
          <div className="flex flex-col">
            <span className="text-base text-gray-200">
              <Skeleton>John doe</Skeleton>
            </span>
            <span className="text-sm font-medium text-gray-400">
              <Skeleton>@johndoe</Skeleton>
            </span>
          </div>
        </SearchHeader>
        <p className="text-gray-300 text-sm leading-7">
          <Skeleton>About user lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.</Skeleton>
        </p>
      </SearchContentBox>
    </Search>
  );
}
