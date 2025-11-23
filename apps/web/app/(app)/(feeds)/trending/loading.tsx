import { Separator } from "@votewise/ui/separator";

import { HotFeedsSkeleton, HotUserSkeleton, SuggestedUsersSkeleton } from "./_components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-200 mb-2">People to Follow</h2>
          <p className="text-sm text-gray-400">Discover interesting people in the community</p>
        </div>
        <SuggestedUsersSkeleton />
        <Separator className="h-px w-full" />
      </section>
      <section>
        <h2 className="text-xl font-medium text-gray-200 mb-6">Trending Users</h2>
        <HotUserSkeleton />
      </section>
      <section className="pb-5">
        <h2 className="text-xl font-medium text-gray-300 mb-6">Trending Posts</h2>
        <HotFeedsSkeleton />
      </section>
    </div>
  );
}
