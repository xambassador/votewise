"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";
import type { VirtuosoHandle } from "react-virtuoso";

import styles from "./feed-list.module.css";

import { useRef } from "react";
import { Virtuoso } from "react-virtuoso";

import { FeedMolecule } from "@/components/feed";

export function FeedList(props: { feeds: GetAllFeedsResponse }) {
  const { feeds } = props;
  const virtuoso = useRef<VirtuosoHandle>(null);

  return (
    <Virtuoso
      ref={virtuoso}
      useWindowScroll
      initialItemCount={feeds.feeds.length}
      className={styles["virtual-feed-list"]}
      data={feeds.feeds}
      computeItemKey={(i, data) => `${data.id}-${i}`}
      itemContent={(index, data) => <FeedMolecule data={data} key={data.id + "-" + index} />}
    />
  );
}
