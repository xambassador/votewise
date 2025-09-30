import { FeedListFetcher } from "../_components/feed-fetcher";
import { FeedList } from "../_components/feed-list";

export default function Home() {
  return <FeedListFetcher>{(feeds) => <FeedList feeds={feeds} />}</FeedListFetcher>;
}
