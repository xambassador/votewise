import { Suspense } from "react";
import Link from "next/link";

import { ImageCard } from "@votewise/ui/image-card";
import { Separator } from "@votewise/ui/separator";

import { routes } from "@/lib/routes";

import { HotFeedFetcher, HotUsersFetcher, SuggestedUsersFetcher } from "../_components/feed-fetcher";
import { HotFeeds } from "./_components/hot-feeds";
import { HotUsers } from "./_components/hot-users";
import { HotFeedsSkeleton, HotUserSkeleton, SuggestedUsersSkeleton } from "./_components/skeleton";

export default function TrendingPage() {
  return (
    <div className="space-y-8">
      <SuggestedUsers />
      <TrendingUsers />
      <TrendingPosts />
    </div>
  );
}

async function TrendingPosts() {
  return (
    <section className="pb-5">
      <h2 className="text-lg font-semibold text-gray-300 mb-6">Trending Posts</h2>
      <Suspense fallback={<HotFeedsSkeleton />}>
        <HotFeedFetcher>{(data) => <HotFeeds data={data} />}</HotFeedFetcher>
      </Suspense>
    </section>
  );
}

async function TrendingUsers() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-200 mb-6">Trending Users</h2>
      <Suspense fallback={<HotUserSkeleton />}>
        <HotUsersFetcher>{(data) => <HotUsers data={data} />}</HotUsersFetcher>
      </Suspense>
    </section>
  );
}

async function SuggestedUsers() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-200 mb-2">People to Follow</h2>
        <p className="text-sm text-gray-400">Discover interesting people in the community</p>
      </div>
      <Suspense fallback={<SuggestedUsersSkeleton />}>
        <SuggestedUsersFetcher>
          {(data) => {
            const perRow = 25;
            const totalRows = Math.ceil(data.users.length / perRow);
            const rows = Array.from({ length: totalRows }).map((_, index) =>
              data.users.slice(index * perRow, (index + 1) * perRow)
            );
            return (
              <div className="w-full overflow-x-hidden">
                {rows.map((row, index) => (
                  <div key={index} className="flex items-center -space-x-10 w-full overflow-x-auto scroller py-5 px-4">
                    {row.map((user, index) => (
                      <Link
                        style={{ "--rotate": `${index % 2 === 0 ? -6 : 5}deg` } as React.CSSProperties}
                        href={routes.user.profile(user.user_name)}
                        key={user.id}
                        className="focus-within-presets img-card-base peer"
                      >
                        <ImageCard url={user.avatar_url ?? ""} alt={user.first_name + " " + user.last_name} />
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            );
          }}
        </SuggestedUsersFetcher>
      </Suspense>
      <Separator className="h-px w-full" />
    </section>
  );
}
