import { PAGINATION } from "@votewise/constant";
import { ImageCard } from "@votewise/ui/image-card";
import { Skeleton } from "@votewise/ui/skeleton";

import { FeedSkeleton } from "@/components/feed-skeleton";

export function HotUserSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: PAGINATION.trending.limit }).map((_, index) => (
        <div key={index} className="p-5 rounded-xl bg-nobelBlack-100 border border-nobelBlack-200">
          <div className="flex items-start gap-4">
            <Skeleton className="size-12 rounded-full min-w-12" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-lg text-gray-300">
                  <Skeleton>John doe</Skeleton>
                </span>
                <span className="text-gray-400 text-xs">
                  <Skeleton>@johndoe</Skeleton>
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                <Skeleton>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aut, quidem.</Skeleton>
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-blue-300 font-bold">
                      <Skeleton>1.2K</Skeleton>
                    </span>
                    <span className="text-gray-400">
                      <Skeleton>followers</Skeleton>
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-300 font-bold">
                      <Skeleton>345</Skeleton>
                    </span>
                    <span className="text-gray-400">
                      <Skeleton>posts</Skeleton>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HotFeedsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: PAGINATION.trending.limit }).map((_, index) => (
        <FeedSkeleton key={index} />
      ))}
    </div>
  );
}

export function SuggestedUsersSkeleton() {
  const perRow = 25;
  const totalRows = Math.ceil(50 / perRow);
  const data = Array.from({ length: 50 });
  const rows = Array.from({ length: totalRows }).map((_, index) => data.slice(index * perRow, (index + 1) * perRow));
  return (
    <div className="w-full overflow-x-hidden">
      {rows.map((row, index) => (
        <div key={index} className="flex items-center -space-x-10 w-full overflow-x-auto scroller py-5 px-4">
          {row.map((_, index) => (
            <div
              key={index}
              style={{ "--rotate": `${index % 2 === 0 ? -6 : 5}deg` } as React.CSSProperties}
              className="img-card-base peer"
            >
              <ImageCard isLoading url="" alt="" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
