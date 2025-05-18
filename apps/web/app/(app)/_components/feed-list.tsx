"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";
import type { StateSnapshot, VirtuosoHandle } from "react-virtuoso";

import styles from "./feed-list.module.css";

import { useRef } from "react";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Virtuoso } from "react-virtuoso";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let virtuosoState: any = { ranges: [], screenTop: 0 };

export function FeedList(props: { feeds: GetAllFeedsResponse }) {
  const { feeds } = props;
  const virtuoso = useRef<VirtuosoHandle>(null);

  function onScrolling(scrolling: boolean) {
    if (!scrolling) {
      virtuoso?.current?.getState((state: StateSnapshot) => {
        virtuosoState = { ...state };
      });
    }
  }

  function onEndReached() {}

  return (
    <Virtuoso
      ref={virtuoso}
      useWindowScroll
      initialItemCount={feeds.feeds.length}
      className={styles["virtual-feed-list"]}
      data={feeds.feeds}
      computeItemKey={(i, data) => `${data.id}-${i}`}
      isScrolling={onScrolling}
      endReached={onEndReached}
      restoreStateFrom={
        virtuosoState.ranges.length === 0
          ? virtuosoState?.current?.getState((state: StateSnapshot) => state)
          : virtuosoState
      }
      itemContent={(index, data) => <FeedItem feed={data} key={data.id + "-" + index} />}
    />
  );
}

function FeedItem(props: { feed: GetAllFeedsResponse["feeds"][0] }) {
  const { feed } = props;
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
            <AvatarImage src={feed.author.avatar_url || ""} alt={feed.author.first_name} />
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
