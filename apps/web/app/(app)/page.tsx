import { Suspense } from "react";

import { FeedListFetcher } from "./_components/feed-fetcher";
import { FeedList } from "./_components/feed-list";
import Loading from "./loading";

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <FeedListFetcher>{(feeds) => <FeedList feeds={feeds} />}</FeedListFetcher>
    </Suspense>
  );
}
