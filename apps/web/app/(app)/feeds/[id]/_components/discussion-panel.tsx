"use client";

import type { GetCommentsResponse } from "@votewise/client/comment";

import { memo, useMemo } from "react";
import Link from "next/link";
import { useFetchComments } from "@/hooks/use-fetch-comments";
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
  CommentMoreButton,
  CommentReplyButton,
  Comments,
  CommentText,
  ReplyConnector,
  ReplyContainer
} from "@votewise/ui/cards/comment";
import { Error } from "@votewise/ui/error";
import { Comment as CommentIcon } from "@votewise/ui/icons/comment";

import { routes } from "@/lib/routes";

import { CreateComment, ReplyToComment } from "./create-comment";
import { CommentsFetcherFallback } from "./skeleton";

extend(relativeTime);

type Props = {
  comments: GetCommentsResponse;
  id: string;
};

export function DiscussionPanel(props: Props) {
  const { comments: initialData } = props;
  const { status, error, data, nextPageStatus, fetchNextPage } = useFetchComments(props.id, { initialData });
  const memoizedInput = useMemo(() => <CreateComment postId={props.id} />, [props.id]);

  switch (status) {
    case "pending":
      return <CommentsFetcherFallback />;
    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  if (!data) return noDataElement;

  const comments = data.comments;

  return (
    <Comments>
      {memoizedInput}
      <CommentList>
        {comments.length === 0 ? noCommentsElement : null}
        {comments.map((comment) => (
          <MemoizedComment
            key={comment.id}
            avatarUrl={comment.user.avatar_url || undefined}
            createdAt={comment.created_at}
            name={comment.user.first_name + " " + comment.user.last_name}
            text={comment.text}
            userId={comment.user.id}
            commentId={comment.id}
            postId={props.id}
            replyCount={comment.replies.length}
            userName={comment.user.user_name}
          >
            {comment.replies.length > 0 ? (
              <ReplyContainer>
                <ReplyConnector />
                {comment.replies.map((reply) => (
                  <MemoizedComment
                    key={reply.id}
                    avatarUrl={reply.user.avatar_url || undefined}
                    createdAt={reply.created_at}
                    userName={reply.user.user_name}
                    name={reply.user.first_name + " " + reply.user.last_name}
                    text={reply.text}
                    userId={reply.user.id}
                    commentId={null}
                    postId={props.id}
                  />
                ))}
                {comment.pagination.has_next_page ? (
                  <CommentMoreButton className="w-fit">More replies</CommentMoreButton>
                ) : null}
              </ReplyContainer>
            ) : null}
          </MemoizedComment>
        ))}
      </CommentList>
      {data.pagination.has_next_page ? (
        <CommentMoreButton
          loading={nextPageStatus === "loading"}
          className="w-full"
          onClick={() => {
            if (data.pagination.next_page === null) return;
            fetchNextPage(data.pagination.next_page);
          }}
        >
          More
        </CommentMoreButton>
      ) : null}
    </Comments>
  );
}

type MemoizedCommentProps = {
  name: string;
  userName: string;
  avatarUrl: string | undefined;
  createdAt: Date;
  text: string;
  userId: string;
  commentId: string | null;
  postId: string;
  replyCount?: number;
  children?: React.ReactNode;
};

const MemoizedComment = memo(function _Comment(props: MemoizedCommentProps) {
  const { name, avatarUrl, createdAt, text, userId, commentId, postId, children, replyCount = 0, userName } = props;
  return (
    <Comment>
      <Link href={routes.user.profile(userId)} className="focus-visible h-fit">
        <Avatar className="size-8">
          <AvatarFallback name={name} />
          <AvatarImage src={avatarUrl || ""} alt={name} className="object-cover" />
        </Avatar>
      </Link>
      <CommentContent>
        <CommentHeader>
          <Link href={routes.user.profile(userId)} className="hover:underline focus-visible">
            <CommentAuthor>{userName}</CommentAuthor>
          </Link>
          <CommentDate>{dayjs(createdAt).fromNow()}</CommentDate>
        </CommentHeader>
        <CommentText>{text}</CommentText>
        {/*
            TODO:
            Due to design limitation (of course I am working on it..), right now we are not going to allow
            reply to a comment 😛
         */}
        {commentId && (
          <CommentActions>
            <CommentReplyButton />
          </CommentActions>
        )}
        {commentId && <ReplyToComment parentId={commentId} postId={postId} username={userName} />}
        {children}
      </CommentContent>
      <CommentConnectorLine hasReplies={replyCount > 0} />
    </Comment>
  );
});

const noDataElement = <Error error="Failed to get comments!" />;
const noCommentsElement = (
  <div className="flex flex-col items-center justify-center gap-2 w-full">
    <CommentIcon className="text-gray-400" />
    <span className="text-gray-400 text-base">Drop the first thought bomb! 💣</span>
  </div>
);
