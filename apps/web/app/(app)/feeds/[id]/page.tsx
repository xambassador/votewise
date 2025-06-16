import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  Comment,
  CommentActions,
  CommentAuthor,
  CommentConnectorLine,
  CommentContent,
  CommentDate,
  CommentHeader,
  CommentInput,
  CommentList,
  CommentReplyButton,
  CommentReplyInput,
  Comments,
  CommentText
} from "@votewise/ui/cards/comment";
import {
  Feed,
  FeedContent,
  FeedContentTags,
  FeedContentText,
  FeedHeader,
  FeedTimeAgo,
  FeedTitle,
  FeedUserHandle,
  FeedUserName,
  Voters,
  VotersCount,
  VotersStack
} from "@votewise/ui/cards/feed";
import { ZigZagList } from "@votewise/ui/image-card";
import { VoteButton, VoteCount, VoteProvider } from "@votewise/ui/vote-button";

import { FeedFetcher } from "@/app/(app)/_components/feed-fetcher";

extend(relativeTime);

type Props = {
  params: { id: string };
};

export default function Page(props: Props) {
  return (
    <FeedFetcher id={props.params.id}>
      {(result) => (
        <Feed className="gap-5 flex-col">
          <FeedHeader>
            <Avatar className="size-12">
              <AvatarFallback name={result.author.first_name + " " + result.author.last_name} />
              <AvatarImage
                src={result.author.avatar_url || ""}
                alt={result.author.first_name + " " + result.author.last_name}
                className="object-cover"
              />
            </Avatar>
            <div className="flex gap-3">
              <div className="flex flex-col">
                <FeedUserName>{result.author.first_name + " " + result.author.last_name}</FeedUserName>
                <FeedUserHandle>@{result.author.user_name}</FeedUserHandle>
              </div>
              <FeedTimeAgo className="pt-1">{dayjs(result.created_at).fromNow()}</FeedTimeAgo>
            </div>
          </FeedHeader>
          <FeedTitle className="pb-4 border-b border-nobelBlack-200">{result.title}</FeedTitle>
          <FeedContent className="pb-7 border-b border-nobelBlack-200">
            <FeedContentText className="text-base font-normal text-gray-200">{result.content}</FeedContentText>
            <FeedContentTags>#programming #startups</FeedContentTags>
            {result.assets.length > 0 ? (
              <ZigZagList
                images={result.assets}
                imageCardProps={({ image }) => ({ alt: image.alt || "Feed asset" })}
                className="mt-4"
              />
            ) : null}
          </FeedContent>

          <div className="flex flex-col gap-8 pb-4 border-b border-nobelBlack-200">
            <VoteProvider className="w-full max-w-full" count={result.upvote_count}>
              <VoteButton className="w-full max-w-full bg-nobelBlack-50" showCount>
                <VoteCount variant="minimal" />
              </VoteButton>
            </VoteProvider>
            <VotersStack>
              <span className="text-sm text-black-200 inline-block mr-3">Voters:</span>
              <Voters>
                {result.voters.map((voter) => (
                  <Avatar className="size-8" key={voter.id}>
                    <AvatarFallback name="Jane Smith" />
                    <AvatarImage src={voter.avatar_url || ""} alt="Voter" className="object-cover" />
                  </Avatar>
                ))}
              </Voters>
              {result.upvote_count - 10 > 0 ? <VotersCount>+{result.upvote_count - 10}</VotersCount> : null}
            </VotersStack>
          </div>

          <Comments>
            <CommentInput />
            <CommentList>
              <Comment>
                <Avatar className="size-8">
                  <AvatarFallback name="John Doe" />
                  <AvatarImage
                    src="https://cdn.jsdelivr.net/gh/alohe/memojis/png/toon_8.png"
                    alt="Avatar"
                    className="object-cover"
                  />
                </Avatar>
                <CommentContent>
                  <CommentHeader>
                    <CommentAuthor>Jane Smith</CommentAuthor>
                    <CommentDate>1 hour ago</CommentDate>
                  </CommentHeader>
                  <CommentText>
                    I love Python for its simplicity and readability. The vast ecosystem of libraries makes it perfect
                    for almost any project!
                  </CommentText>
                  <CommentActions>
                    <CommentReplyButton />
                  </CommentActions>
                  <CommentReplyInput />
                </CommentContent>
                <CommentConnectorLine />
              </Comment>
            </CommentList>
          </Comments>
        </Feed>
      )}
    </FeedFetcher>
  );
}
