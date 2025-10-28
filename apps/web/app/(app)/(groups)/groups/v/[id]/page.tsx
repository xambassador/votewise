import { Suspense } from "react";

import { FeedListSkeleton } from "@/components/feed-skeleton";

import { GroupFeedList } from "./_components/feed-list";
import { GroupFeedFetcher, GroupFetcher } from "./_components/group-fetcher";
import { GroupView } from "./_components/group-view";

type Props = { params: { id: string } };

export default async function Page(props: Props) {
  const { id } = props.params;
  return (
    <GroupFetcher id={id}>
      {(data) => (
        <div className="flex flex-col gap-5">
          <GroupView group={data} id={id} />
          <Suspense fallback={<FeedListSkeleton className="mt-5" count={5} />}>
            <GroupFeedFetcher id={id}>
              {(feedData) => {
                if (!feedData.hasAccess) {
                  return (
                    <div className="pt-10 flex justify-center">
                      <p className="text-gray-400">
                        You are not a member of this group. To view posts, please join the group.
                      </p>
                    </div>
                  );
                }

                if (feedData.feeds.feeds.length === 0) {
                  return (
                    <div className="pt-10 flex justify-center">
                      <span className="text-gray-400">No posts yet. Be the first to post!</span>
                    </div>
                  );
                }

                return <GroupFeedList feeds={feedData.feeds} groupId={id} />;
              }}
            </GroupFeedFetcher>
          </Suspense>
        </div>
      )}
    </GroupFetcher>
  );
}
