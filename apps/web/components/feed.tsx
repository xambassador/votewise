"use client";

import type { Feed as TFeed } from "@/types";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { truncateOnWord } from "@votewise/text";
import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
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
  VotersCount,
  VotersStack
} from "@votewise/ui/cards/feed";
import { Comment } from "@votewise/ui/icons/comment";
import { PaperPlane } from "@votewise/ui/icons/paper-plane";
import { Separator } from "@votewise/ui/separator";

import { cn } from "@/lib/cn";
import { humanizeNumber } from "@/lib/humanize";
import { routes } from "@/lib/routes";
import { getFullName } from "@/lib/string";

extend(relativeTime);

type Props = { data: TFeed };

export const FeedMolecule = memo(function FeedMolecule(props: Props) {
  const { data: feed } = props;
  const router = useRouter();
  return (
    <Feed
      role="link"
      tabIndex={0}
      onClick={() => router.push(routes.feed.view(feed.id))}
      className="cursor-pointer focus-presets"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(routes.feed.view(feed.id));
        }
      }}
    >
      <VoteContainer>
        <VoteCount>{humanizeNumber(feed.votes)}</VoteCount>
        <VoteLabel>Votes</VoteLabel>
      </VoteContainer>
      <Separator orientation="vertical" className="h-auto" />
      <FeedContainer>
        <div className="flex gap-2">
          <Link
            aria-label={getFullName(feed.author) + "'s avatar"}
            href={routes.user.profile(feed.author.user_name)}
            role="link"
            tabIndex={0}
            className="focus-visible h-fit rounded-full"
            onClick={(e) => e.stopPropagation()}
          >
            <FeedAvatar name={getFullName(feed.author)} url={feed.author.avatar_url || ""} />
          </Link>
          <FeedContent>
            <FeedHeader>
              <FeedUserName asChild>
                <Link
                  href={routes.user.profile(feed.author.user_name)}
                  className="focus-visible rounded hover:underline"
                  role="link"
                  aria-label={"View " + getFullName(feed.author) + "'s profile"}
                  onClick={(e) => e.stopPropagation()}
                >
                  {getFullName(feed.author)}
                </Link>
              </FeedUserName>
              <FeedTimeAgo>{dayjs(feed.created_at).fromNow()}</FeedTimeAgo>
            </FeedHeader>
            <FeedContentText>{truncateOnWord(feed.title, 128)}</FeedContentText>
          </FeedContent>
        </div>
        <FeedFooter>
          <FeedFooterActions>
            <FeedFooterItem>
              <Comment className="text-gray-400" />
              <span className="text-gray-400 text-sm">{humanizeNumber(feed.comments)} Discussions</span>
            </FeedFooterItem>
            <FeedFooterItem>
              <PaperPlane className="text-gray-400" />
              <span className="text-gray-400 text-sm">Share</span>
            </FeedFooterItem>
          </FeedFooterActions>
          <VotersStack>
            <Voters>
              {feed.voters.map((voter) => (
                <FeedAvatar key={voter.id} className="size-6" name="Voter" url={voter.avatar_url || ""} />
              ))}
            </Voters>
            {feed.votes - feed.voters.length > 0 && (
              <VotersCount>+{humanizeNumber(feed.votes - feed.voters.length)}</VotersCount>
            )}
          </VotersStack>
        </FeedFooter>
      </FeedContainer>
    </Feed>
  );
});

const FeedAvatar = memo(function FeedAvatar(props: { name: string; url: string; className?: string }) {
  return (
    <Avatar className={cn("size-12", props.className)}>
      <AvatarFallback name={props.name} />
      <AvatarImage src={props.url} alt={props.name} />
    </Avatar>
  );
});
