"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";
import type { StateSnapshot, VirtuosoHandle } from "react-virtuoso";

import styles from "./feed-list.module.css";

import { useRef, useState } from "react";
import dayjs from "dayjs";
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
  FeedFooterItem,
  FeedHeader,
  FeedImages,
  FeedTimeAgo,
  FeedUserName
} from "@votewise/ui/cards/feed";
import { Confetti } from "@votewise/ui/confetti";
import { Comment } from "@votewise/ui/icons/comment";
import { PaperPlane } from "@votewise/ui/icons/paper-plane";
import { Separator } from "@votewise/ui/separator";
import { VoteButton, VoteCount, VoteProvider } from "@votewise/ui/vote-button";

dayjs.extend(relativeTime);

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

  const [isVoted, setIsVoted] = useState(false);

  return (
    <Feed>
      <VoteProvider>
        <VoteCount />
        {isVoted && <Confetti amount={30} />}
        <VoteButton onClick={() => setIsVoted(true)}>Vote</VoteButton>
      </VoteProvider>
      <Separator orientation="vertical" className="min-h-[200px] h-auto" />
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
            <FeedContentText>{truncateOnWord(feed.content, 128)}</FeedContentText>
            <FeedContentTags>
              {feed.hash_tags.map((tag) => (
                <span key={tag.name}>#{tag.name}</span>
              ))}
            </FeedContentTags>
            <FeedImages className="mt-2" images={feed.assets.map((asset) => asset.url)} />
          </FeedContent>
        </div>

        <FeedFooter>
          <FeedFooterItem>
            <Comment className="text-gray-400" />
            <span className="text-gray-400 text-xs">3 discussions</span>
          </FeedFooterItem>
          <FeedFooterItem>
            <PaperPlane className="text-gray-400" />
            <span className="text-gray-400 text-xs">Share</span>
          </FeedFooterItem>
        </FeedFooter>
      </FeedContainer>
    </Feed>
  );
}
