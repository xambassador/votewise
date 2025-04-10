import { Suspense } from "react";

import { Spinner } from "@votewise/ui/ring-spinner";

import { FlashProvider } from "@/components/flash-provider";
import { NavTabs } from "@/components/nav-tabs";

import { FeedList } from "./_components/feed-list";

export default async function Home() {
  return (
    <FlashProvider>
      <NavTabs />
      <Suspense fallback={<Loading />}>
        <RetrieveFeed />
      </Suspense>
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
  return <FeedList />;
}
