import type { Feed as TFeed } from "@/types";

import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { truncateOnWord } from "@votewise/text";
import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  Feed,
  FeedContainer,
  FeedContent,
  FeedContentTags,
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
  VotersCount,
  VotersStack
} from "@votewise/ui/cards/feed";
import { Comment } from "@votewise/ui/icons/comment";
import { PaperPlane } from "@votewise/ui/icons/paper-plane";
import { Separator } from "@votewise/ui/separator";

extend(relativeTime);

type Props = {
  data: TFeed;
};

export function FeedMolecule(props: Props) {
  const { data: feed } = props;
  return (
    <Feed>
      <VoteContainer>
        <VoteCount>{feed.votes}</VoteCount>
        <VoteLabel>Votes</VoteLabel>
      </VoteContainer>
      <Separator orientation="vertical" className="h-auto" />
      <FeedContainer>
        <div className="flex gap-2">
          <Avatar className="size-12">
            <AvatarFallback name={feed.author.first_name + " " + feed.author.last_name} />
            <AvatarImage src={feed.author.avatar_url || ""} alt={feed.author.first_name} className="object-cover" />
          </Avatar>
          <FeedContent>
            <FeedHeader>
              <FeedUserName>{feed.author.first_name + " " + feed.author.last_name}</FeedUserName>
              <FeedTimeAgo>{dayjs(feed.created_at).fromNow()}</FeedTimeAgo>
            </FeedHeader>
            <FeedContentText>{truncateOnWord(feed.title, 128)}</FeedContentText>
            <FeedContentTags>
              {feed.hash_tags.map((tag) => (
                <span key={tag.name}>#{tag.name}</span>
              ))}
            </FeedContentTags>
          </FeedContent>
        </div>

        <FeedFooter>
          <FeedFooterActions>
            <FeedFooterItem>
              <Comment className="text-gray-400" />
              <span className="text-gray-400 text-xs">{feed.comments} Discussions</span>
            </FeedFooterItem>
            <FeedFooterItem>
              <PaperPlane className="text-gray-400" />
              <span className="text-gray-400 text-xs">Share</span>
            </FeedFooterItem>
          </FeedFooterActions>
          <VotersStack>
            <Voters>
              {feed.voters.map((voter) => (
                <Avatar className="size-6" key={voter.id}>
                  <AvatarFallback name="Voter" />
                  <AvatarImage src={voter.avatar_url || ""} alt={voter.id} />
                </Avatar>
              ))}
            </Voters>
            {feed.votes - feed.voters.length > 0 && <VotersCount>+{feed.votes - feed.voters.length}</VotersCount>}
          </VotersStack>
        </FeedFooter>
      </FeedContainer>
    </Feed>
  );
}
