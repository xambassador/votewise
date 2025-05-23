import { Suspense } from "react";

import { Container } from "@/components/container";
import { FlashProvider } from "@/components/flash-provider";
import { FeedTabs } from "@/components/nav-tabs";

import { FeedFetcher } from "./_components/feed-fetcher";
import { FeedList } from "./_components/feed-list";
import Loading from "./loading";

export default function Home() {
  return (
    <FlashProvider>
      <FeedTabs />
      <Container>
        <Suspense fallback={<Loading />}>
          <FeedFetcher>{(feeds) => <FeedList feeds={feeds} />}</FeedFetcher>
        </Suspense>
      </Container>
    </FlashProvider>
  );
}
