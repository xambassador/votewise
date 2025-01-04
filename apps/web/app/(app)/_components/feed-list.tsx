"use client";

import type { StateSnapshot, VirtuosoHandle } from "react-virtuoso";

import styles from "./feed-list.module.css";

import { useRef } from "react";
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
  FeedUserHandle,
  FeedUserName
} from "@votewise/ui/cards/feed";
import { Comment } from "@votewise/ui/icons/comment";
import { PaperPlane } from "@votewise/ui/icons/paper-plane";
import { Separator } from "@votewise/ui/separator";
import { VoteButton, VoteCount, VoteProvider } from "@votewise/ui/vote-button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let virtuosoState: any = { ranges: [], screenTop: 0 };

const data = [
  {
    id: "feed_1cas",
    user: {
      name: "Salma Knight",
      handle: "@salma_knight",
      timeAgo: "2d",
      avatar: "/votewise-bucket/votewise/assets/avatars/default_avatar.png"
    },
    content: {
      text: "Just got back from traveling to Japan. The culture, the food, and the people were absolutely incredible.",
      tags: ["#travelling", "#fly"],
      images: [
        { src: "/votewise-bucket/votewise/assets/avatars/default_avatar.png" },
        { src: "/votewise-bucket/votewise/assets/avatars/default_avatar.png" },
        { src: "/votewise-bucket/votewise/assets/avatars/default_avatar.png" },
        { src: "/votewise-bucket/votewise/assets/avatars/default_avatar.png" }
      ]
    }
  }
];

export function FeedList() {
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
      initialItemCount={data.length}
      className={styles["virtual-feed-list"]}
      data={data}
      computeItemKey={(i, data) => `${data.id}-${i}`}
      isScrolling={onScrolling}
      endReached={onEndReached}
      restoreStateFrom={
        virtuosoState.ranges.length === 0
          ? virtuosoState?.current?.getState((state: StateSnapshot) => state)
          : virtuosoState
      }
      itemContent={(index, data) => (
        <Feed>
          <VoteProvider>
            <VoteCount />
            <VoteButton>Vote</VoteButton>
          </VoteProvider>
          <Separator orientation="vertical" className="min-h-[200px] h-auto" />
          <FeedContainer>
            <div className="flex gap-2">
              <Avatar className="size-12">
                <AvatarFallback>JD</AvatarFallback>
                <AvatarImage src={data.user.avatar} alt={data.user.name} />
              </Avatar>
              <FeedContent>
                <FeedHeader>
                  <FeedUserName>{data.user.name}</FeedUserName>
                  <FeedUserHandle>{data.user.handle}</FeedUserHandle>
                  <FeedTimeAgo>{data.user.timeAgo}</FeedTimeAgo>
                </FeedHeader>
                <FeedContentText>{truncateOnWord(data.content.text, 128)}</FeedContentText>
                <FeedContentTags>
                  {data.content.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </FeedContentTags>
                <FeedImages className="mt-2" images={data.content.images.map((image) => image.src)} />
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
      )}
    />
  );
}
