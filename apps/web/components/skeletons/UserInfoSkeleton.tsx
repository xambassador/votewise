import React from "react";

import { Skeleton, SkeletonContainer } from "@votewise/ui";

export function UserInfoSkeleton() {
  return (
    <SkeletonContainer className="relative w-full">
      <div className="relative">
        <Skeleton as="div" className="h-[calc((120/16)*1rem)] w-full rounded-lg" />
        <Skeleton
          as="div"
          className="absolute -bottom-6 left-1/2 h-16 w-16 -translate-x-1/2"
          loadingClassName="bg-gray-400"
        />
      </div>
      <Skeleton as="div" className="mx-auto mt-8 h-10 w-28 rounded-full" />
      <ul className="mx-auto mt-2 flex w-[calc((190/16)*1rem)] items-center justify-between">
        {Array.from({ length: 3 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton as="li" className="h-6 w-1/4 rounded-full" key={`key-${index}`} />
        ))}
      </ul>
      <Skeleton as="button" className="mt-2 h-11 w-full py-3" />
    </SkeletonContainer>
  );
}

export function UserPillSkeleton() {
  return (
    <SkeletonContainer className="flex items-center">
      <Skeleton as="div" className="mr-2 h-12 w-12 rounded-full" />
      <Skeleton as="div" className="h-4 w-28 rounded-lg" />
    </SkeletonContainer>
  );
}
