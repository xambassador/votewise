import {
  Comment,
  CommentAuthor,
  CommentConnectorLine,
  CommentContent,
  CommentDate,
  CommentHeader,
  CommentInput,
  CommentList,
  Comments,
  CommentText
} from "@votewise/ui/cards/comment";
import {
  Feed,
  FeedContent,
  FeedContentText,
  FeedHeader,
  FeedTimeAgo,
  FeedTitle,
  FeedUserHandle,
  FeedUserName,
  Voters,
  VotersStack
} from "@votewise/ui/cards/feed";
import { Skeleton } from "@votewise/ui/skeleton";

export function FeedSkeleton() {
  return (
    <Feed className="gap-5 flex-col mb-10">
      <FeedSkeletonShell />
      <Comments>
        <Skeleton className="h-10 rounded" />
        <CommentListSkeleton />
      </Comments>
    </Feed>
  );
}

export function FeedSkeletonShell() {
  return (
    <>
      <FeedHeader>
        <Skeleton className="size-12 rounded-full" />
        <div className="flex gap-3">
          <div className="flex flex-col">
            <FeedUserName>
              <Skeleton>John doe</Skeleton>
            </FeedUserName>
            <FeedUserHandle>
              <Skeleton>@john</Skeleton>
            </FeedUserHandle>
          </div>
          <FeedTimeAgo className="pt-1">
            <Skeleton>1d ago</Skeleton>
          </FeedTimeAgo>
        </div>
      </FeedHeader>
      <FeedTitle className="pb-4 border-b border-nobelBlack-200">
        <Skeleton>This is a title of the post to represent loading state</Skeleton>
      </FeedTitle>
      <FeedContent className="pb-7 border-b border-nobelBlack-200">
        <FeedContentText className="text-base font-normal text-gray-200 leading-7">
          <Skeleton>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae libero quos pariatur, numquam enim veritatis
            iure reprehenderit quod laborum eum natus recusandae assumenda necessitatibus nemo vitae dignissimos eos.
            Explicabo facilis, aspernatur, quasi consequatur molestiae provident assumenda dolore numquam dolor velit
            sit aut hic facere mollitia maiores, asperiores deleniti dolorum exercitationem.
          </Skeleton>
        </FeedContentText>
      </FeedContent>

      <div className="flex flex-col gap-8 pb-4 border-b border-nobelBlack-200">
        <Skeleton className="h-12 rounded-xl" />
        <VotersStack>
          <span className="text-sm text-black-200 inline-block mr-3">
            <Skeleton>Voters:</Skeleton>
          </span>
          <Voters>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="size-8 avatar-stack-skeleton" />
            ))}
          </Voters>
        </VotersStack>
      </div>
    </>
  );
}

function CommentListSkeleton() {
  return (
    <CommentList>
      {Array.from({ length: 3 }).map((_, i) => (
        <Comment key={i}>
          <Skeleton className="size-8 min-w-8 rounded-full" />
          <CommentContent>
            <CommentHeader>
              <CommentAuthor>
                <Skeleton>John Doe</Skeleton>
              </CommentAuthor>
              <CommentDate>
                <Skeleton>2d ago</Skeleton>
              </CommentDate>
            </CommentHeader>
            <CommentText>
              <Skeleton>Lorem ipsum dolor sit amet</Skeleton>
            </CommentText>
          </CommentContent>
          <CommentConnectorLine hasReplies />
        </Comment>
      ))}
    </CommentList>
  );
}

export function CommentsFetcherFallback() {
  return (
    <Comments>
      <CommentInput disabled style={{ height: 40 }} />
      <CommentListSkeleton />
    </Comments>
  );
}
