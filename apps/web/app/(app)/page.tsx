import { Suspense } from "react";

import { Spinner } from "@votewise/ui/ring-spinner";

import { FlashMessage } from "@/components/flash";
import { NavTabs } from "@/components/nav-tabs";

import { getFlashMessage } from "@/lib/cookie";

import { FeedList } from "./_components/feed-list";

export default async function Home() {
  const flash = getFlashMessage();

  return (
    <>
      {flash && <FlashMessage title={flash.title} message={flash.message} type={flash.type} />}
      <NavTabs />
      <Suspense fallback={<Loading />}>
        <RetrieveFeed />
      </Suspense>
    </>
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
