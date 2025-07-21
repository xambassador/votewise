"use client";

import type { GetAllFeedsResponse } from "@votewise/client/feed";

import { FeedMolecule } from "@/components/feed";

export function FeedList(props: { feeds: GetAllFeedsResponse }) {
  const { feeds } = props;
  return (
    <div className="flex flex-col gap-5">
      {feeds.feeds.map((feed) => (
        <FeedMolecule data={feed} key={feed.id} />
      ))}
    </div>
  );
}
