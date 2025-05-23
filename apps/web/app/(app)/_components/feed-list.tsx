"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";
import type { StateSnapshot, VirtuosoHandle } from "react-virtuoso";

import styles from "./feed-list.module.css";

import { useRef } from "react";
import { Virtuoso } from "react-virtuoso";

import { FeedMolecule } from "@/components/feed";

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
  return <FeedMolecule data={feed} />;
}
