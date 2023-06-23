import Link from "next/link";

import React from "react";

import { classNames } from "@votewise/lib";
import { FiMessageCircle as Message, FiSend as Sent, FiThumbsUp as Upvote } from "@votewise/ui/icons";

import {
  ButtonGroup,
  Post,
  PostFooter,
  PostGallary,
  PostStatuPill,
  PostText,
  PostTitle,
  PostUserPill,
} from "components/post";

import { parsePostStatus } from "lib/parsePostStatus";

function PostCard() {
  return (
    <Post>
      <PostUserPill
        avatar="https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2"
        location="Lagos, Nigeria"
        timeAgo="2h ago"
        userName="Alex Suprun"
      >
        <div className="flex h-fit items-center gap-4">
          <PostStatuPill type={parsePostStatus("OPEN")}>open</PostStatuPill>
        </div>
      </PostUserPill>
      <PostTitle>
        <Link href="/">Best way to save energy</Link>
      </PostTitle>
      <PostGallary images={[]} />
      <PostText>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum. Quisquam, voluptatum.
        Quisquam,
      </PostText>
      <PostFooter>
        <ButtonGroup>
          <button type="button" className="disabled:cursor-not-allowed">
            <Upvote className={classNames("h-5 w-5 text-gray-500")} />
          </button>
          <span className="text-sm text-gray-600">2180</span>
        </ButtonGroup>
        <ButtonGroup>
          <span>
            <Message className="h-5 w-5 text-gray-500" />
          </span>
          <span className="text-sm text-gray-600">987 Comments</span>
        </ButtonGroup>
        <ButtonGroup>
          <span>
            <Sent className="h-5 w-5 text-gray-500" />
          </span>
          <span className="text-sm text-gray-600">Share</span>
        </ButtonGroup>
      </PostFooter>
    </Post>
  );
}

export default function Trending() {
  return (
    <div className="flex flex-col gap-8">
      <PostCard />
      <PostCard />
      <PostCard />
    </div>
  );
}
