import { Suspense } from "react";

import { FeedFetcher } from "./_components/feed-fetcher";
import { FeedList } from "./_components/feed-list";
import Loading from "./loading";

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <FeedFetcher>{(feeds) => <FeedList feeds={feeds} />}</FeedFetcher>
    </Suspense>
  );
}
