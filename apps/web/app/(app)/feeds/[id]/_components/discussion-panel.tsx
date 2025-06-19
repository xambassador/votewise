"use client";

import type { Comments as TComments } from "@/types";

import { useState } from "react";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  Comment,
  CommentActions,
  CommentAuthor,
  CommentConnectorLine,
  CommentContent,
  CommentDate,
  CommentHeader,
  CommentList,
  CommentReplyButton,
  CommentReplyInput,
  Comments,
  CommentText
} from "@votewise/ui/cards/comment";
import { Comment as CommentIcon } from "@votewise/ui/icons/comment";

import { useMe } from "@/components/user-provider";

import { CreateComment } from "./create-comment";

extend(relativeTime);

type Props = {
  comments: TComments;
  id: string;
};

export function DiscussionPanel(props: Props) {
  const { comments: _comments } = props;
  const [comments, setComments] = useState(_comments);
  const currentUser = useMe("DiscussionPanel");

  return (
    <Comments>
      <CreateComment
        postId={props.id}
        onCommentCreated={(data) => {
          setComments((prev) => [
            {
              id: data.id,
              text: data.text,
              created_at: new Date(),
              updated_at: new Date(),
              user: {
                avatar_url: currentUser.avatar_url,
                first_name: currentUser.first_name,
                last_name: currentUser.last_name,
                user_name: currentUser.username,
                id: currentUser.id
              }
            },
            ...prev
          ]);
        }}
      />
      <CommentList>
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 w-full">
            <CommentIcon className="text-gray-400" />
            <span className="text-gray-400 text-base">Drop the first thought bomb! 💣</span>
          </div>
        ) : null}
        {comments.map((comment) => (
          <Comment key={comment.id}>
            <Avatar className="size-8">
              <AvatarFallback name={comment.user.first_name + " " + comment.user.last_name} />
              <AvatarImage
                src={comment.user.avatar_url || ""}
                alt={comment.user.first_name + " " + comment.user.last_name}
                className="object-cover"
              />
            </Avatar>
            <CommentContent>
              <CommentHeader>
                <CommentAuthor>{comment.user.first_name + " " + comment.user.last_name}</CommentAuthor>
                <CommentDate>{dayjs(comment.created_at).fromNow()}</CommentDate>
              </CommentHeader>
              <CommentText>{comment.text}</CommentText>
              <CommentActions>
                <CommentReplyButton />
              </CommentActions>
              <CommentReplyInput />
            </CommentContent>
            <CommentConnectorLine />
          </Comment>
        ))}
      </CommentList>
    </Comments>
  );
}
