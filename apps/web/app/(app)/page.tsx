import { Suspense } from "react";

import { Spinner } from "@votewise/ui/ring-spinner";

import { FlashProvider } from "@/components/flash-provider";
import { NavTabs } from "@/components/nav-tabs";

import { getFeedClient } from "@/lib/client.server";

import { FeedList } from "./_components/feed-list";

export default async function Home() {
  return (
    <FlashProvider>
      <div className="pb-5">
        <NavTabs />
        <Suspense fallback={<Loading />}>
          <RetrieveFeed />
        </Suspense>
      </div>
    </FlashProvider>
  );
}

function Loading() {
  return (
    <div className="min-h-[calc(100vh-58px)] flex flex-col items-center justify-center">
      <Spinner />
    </div>
  );
}

async function RetrieveFeed() {
  const feed = getFeedClient();
  const feedResult = await feed.get();
  if (!feedResult.success) {
    return <div>{feedResult.error}</div>;
  }
  return <FeedList feeds={feedResult.data} />;
}
