import { PAGINATION } from "@votewise/constant";
import {
  Feed,
  FeedContainer,
  FeedContent,
  FeedContentText,
  FeedFooter,
  FeedFooterActions,
  FeedFooterItem,
  FeedHeader,
  FeedTimeAgo,
  FeedUserName,
  VoteContainer,
  VoteCount,
  VoteLabel,
  Voters,
  VotersStack
} from "@votewise/ui/cards/feed";
import { Separator } from "@votewise/ui/separator";
import { Skeleton } from "@votewise/ui/skeleton";

import { cn } from "@/lib/cn";

export function FeedListSkeleton(props: React.HTMLAttributes<HTMLDivElement> & { count?: number }) {
  const count = props.count ?? PAGINATION.feeds.limit;
  return (
    <div {...props} className={cn("flex flex-col gap-5", props.className)}>
      {Array.from({ length: count }).map((_, i) => (
        <FeedSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <Feed>
      <VoteContainer>
        <VoteCount>
          <Skeleton>0</Skeleton>
        </VoteCount>
        <VoteLabel>
          <Skeleton>Votes</Skeleton>
        </VoteLabel>
      </VoteContainer>
      <Separator orientation="vertical" className="h-auto" />
      <FeedContainer>
        <div className="flex gap-2">
          <Skeleton className="size-12 rounded-full min-w-12" />
          <FeedContent>
            <FeedHeader>
              <FeedUserName>
                <Skeleton>John Doe</Skeleton>
              </FeedUserName>
              <FeedTimeAgo>
                <Skeleton>5 minutes ago</Skeleton>
              </FeedTimeAgo>
            </FeedHeader>
            <FeedContentText className="leading-8">
              <Skeleton>
                {"This is a sample feed content. It is meant to represent the loading state of a feed item.".substring(
                  0,
                  50
                )}
              </Skeleton>
            </FeedContentText>
          </FeedContent>
        </div>

        <FeedFooter>
          <FeedFooterActions>
            <FeedFooterItem>
              <Skeleton className="size-6" />
              <span className="text-gray-400 text-xs">
                <Skeleton>0 Discussions</Skeleton>
              </span>
            </FeedFooterItem>
            <FeedFooterItem>
              <Skeleton className="size-6" />
              <span className="text-gray-400 text-xs">
                <Skeleton>Share</Skeleton>
              </span>
            </FeedFooterItem>
          </FeedFooterActions>
          <VotersStack>
            <Voters>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="size-6 avatar-stack-skeleton" />
              ))}
            </Voters>
          </VotersStack>
        </FeedFooter>
      </FeedContainer>
    </Feed>
  );
}
