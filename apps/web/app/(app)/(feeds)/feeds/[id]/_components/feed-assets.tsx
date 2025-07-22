"use client";

import type { GetFeedResponse } from "@votewise/client/feed";

import { ZigZagList } from "@votewise/ui/image-card";

type Props = {
  assets: GetFeedResponse["assets"];
};

export function FeedAssets(props: Props) {
  const { assets } = props;
  return (
    <ZigZagList images={assets} imageCardProps={({ image }) => ({ alt: image.alt || "Feed asset" })} className="mt-4" />
  );
}
