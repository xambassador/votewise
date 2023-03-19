// import type { GetServerSidePropsContext } from "next";
import Link from "next/link";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import React from "react";

import { Avatar, Button } from "@votewise/ui";
import { FiMessageCircle as Message, FiSend as Sent, FiThumbsUp as Upvote } from "@votewise/ui/icons";

import { ButtonGroup } from "components";
import {
  Post,
  PostAddCommentInput,
  PostFooter,
  PostGallary,
  PostHashTags,
  PostStatuPill,
  PostText,
  PostTitle,
  PostUserPill,
} from "components/post";
import {
  Comment,
  CommentActions,
  CommentBody,
  CommentHeader,
  CommentSeparator,
  CommentText,
  CommentsWrapper,
} from "components/post/comments";

export default function Page() {
  return (
    <div>
      <Post>
        <PostUserPill
          avatar="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61"
          location="Moon"
          timeAgo="2 hours ago"
          userName="Yash"
        >
          <div className="flex h-fit items-center gap-4">
            <PostStatuPill type="success">Active</PostStatuPill>
            <button type="button">
              <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </PostUserPill>
        <PostTitle>
          <Link href="/post/12">This is Naoimi’s Cool Idea to save environment</Link>
        </PostTitle>
        <PostGallary images={[]} />
        <PostText>
          The chair sat in the corner where it had been for over 25 years. The only difference was there was
          someone actually sitting in it. How long had it been since someone had done that? Ten years or more
          he imagined. Yet there was no denying the presence in the chair now.{" "}
        </PostText>
        <PostHashTags>
          <Link href={`/hashtag/${12}`}>#cool</Link>
        </PostHashTags>
        <PostFooter>
          <ButtonGroup>
            <span>
              <Upvote className="h-5 w-5 text-gray-500" />
            </span>
            <span className="text-sm text-gray-600">10</span>
          </ButtonGroup>
          <ButtonGroup>
            <span>
              <Message className="h-5 w-5 text-gray-500" />
            </span>
            <span className="text-sm text-gray-600">20 Comments</span>
          </ButtonGroup>
          <ButtonGroup>
            <span>
              <Sent className="h-5 w-5 text-gray-500" />
            </span>
            <span className="text-sm text-gray-600">Share</span>
          </ButtonGroup>
        </PostFooter>

        <div className="flex gap-7">
          <Avatar
            src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61"
            width={48}
            height={48}
            rounded
            className="flex-[0_0_48px]"
          />
          <PostAddCommentInput name="comment" placeholder="Add your comment" />
        </div>

        {/* Comments */}
        <CommentsWrapper>
          <Comment>
            <CommentHeader>
              <Avatar
                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61"
                width={48}
                height={48}
                rounded
                className="flex-[0_0_48px]"
              />
              <span className="text-base font-medium text-gray-800">Lisa moris</span>
              <span className="text-sm text-gray-600">1h ago</span>
              <button type="button" className="ml-auto">
                <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
              </button>
            </CommentHeader>

            <CommentBody>
              <CommentSeparator />
              <div className="ml-3 flex flex-col gap-2">
                <CommentText>
                  {" "}
                  The young man wanted a role model. He looked long and hard in his youth, but that role model
                  never materialized. His only choice was to embrace all the people in his life he did not
                  want to be like.
                </CommentText>

                <CommentActions />
              </div>
            </CommentBody>
          </Comment>
          <Comment>
            <CommentHeader>
              <Avatar
                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61"
                width={48}
                height={48}
                rounded
                className="flex-[0_0_48px]"
              />
              <span className="text-base font-medium text-gray-800">Lisa moris</span>
              <span className="text-sm text-gray-600">1h ago</span>
            </CommentHeader>

            <CommentBody>
              <CommentSeparator />
              <div className="ml-3 flex flex-col gap-2">
                <CommentText>
                  {" "}
                  The young man wanted a role model. He looked long and hard in his youth, but that role model
                  never materialized. His only choice was to embrace all the people in his life he did not
                  want to be like.
                </CommentText>

                <CommentActions />
              </div>
            </CommentBody>
          </Comment>
          <Button className="bg-gray-800 py-3 text-gray-50">Load more discussion</Button>
        </CommentsWrapper>
      </Post>
    </div>
  );
}

// export const getServerSideProps = async (context: GetServerSidePropsContext) => {
//   return {
//     props: {},
//   };
// };
