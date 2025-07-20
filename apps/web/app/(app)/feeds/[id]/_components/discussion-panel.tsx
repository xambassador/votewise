"use client";

import type { GetCommentsResponse } from "@votewise/client/comment";

import { memo, useMemo } from "react";
import Link from "next/link";
import { useFetchComments } from "@/hooks/use-fetch-comments";
import { useFetchReplies } from "@/hooks/use-fetch-replies";
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
  CommentUpdatedLabel,
  ReplyConnector,
  ReplyContainer
} from "@votewise/ui/cards/comment";
import { Error } from "@votewise/ui/error";
import { Comment as CommentIcon } from "@votewise/ui/icons/comment";

import { useMe } from "@/components/user-provider";

import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import { CreateComment, ReplyToComment } from "./create-comment";
import { EditComment, EditCommentButton } from "./edit-comment";
import { CommentsFetcherFallback } from "./skeleton";

extend(relativeTime);

type Props = {
  comments: GetCommentsResponse;
  id: string;
};

export function DiscussionPanel(props: Props) {
  const { comments: initialData } = props;
  const { status, error, data, getTriggerProps } = useFetchComments(props.id, { initialData });
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
            isEdited={comment.is_edited}
            shouldReply
          >
            <Replies
              pagination={comment.pagination}
              postId={props.id}
              replies={comment.replies}
              parentId={comment.id}
            />
          </MemoizedComment>
        ))}
      </CommentList>
      {data.pagination.has_next_page ? (
        <CommentMoreButton {...getTriggerProps({ className: "w-full", children: "More" })} />
      ) : null}
    </Comments>
  );
}

type RepliesProps = {
  replies: GetCommentsResponse["comments"][0]["replies"];
  pagination: GetCommentsResponse["comments"][0]["pagination"];
  postId: string;
  parentId: string;
};

const Replies = memo(function Replies(props: RepliesProps) {
  const { replies, postId, parentId, pagination } = props;
  const { data, error, status, getTriggerProps } = useFetchReplies({
    feedId: postId,
    parentId,
    initialData: { replies, pagination }
  });

  switch (status) {
    case "pending":
      return <CommentsFetcherFallback />;
    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  if (!data) return noDataElement;
  if (data.replies.length === 0) return null;

  return (
    <ReplyContainer>
      <ReplyConnector />
      {data.replies.map((reply) => (
        <MemoizedComment
          key={reply.id}
          avatarUrl={reply.user.avatar_url || undefined}
          createdAt={reply.created_at}
          userName={reply.user.user_name}
          name={reply.user.first_name + " " + reply.user.last_name}
          text={reply.text}
          userId={reply.user.id}
          commentId={reply.id}
          shouldReply={false}
          postId={postId}
          parentId={parentId}
        />
      ))}
      {data.pagination.has_next_page ? (
        <CommentMoreButton {...getTriggerProps({ className: "w-fit", children: "More replies" })} />
      ) : null}
    </ReplyContainer>
  );
});

type MemoizedCommentProps = {
  name: string;
  userName: string;
  avatarUrl: string | undefined;
  createdAt: Date;
  text: string;
  userId: string;
  commentId: string;
  shouldReply?: boolean;
  postId: string;
  replyCount?: number;
  children?: React.ReactNode;
  isEdited?: boolean;
  parentId?: string;
};

const MemoizedComment = memo(function _Comment(props: MemoizedCommentProps) {
  const {
    name,
    avatarUrl,
    createdAt,
    text,
    userId,
    commentId,
    postId,
    children,
    replyCount = 0,
    userName,
    isEdited,
    shouldReply,
    parentId
  } = props;
  const { id } = useMe("MemoizedComment");
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
          {isEdited && <CommentUpdatedLabel>edited</CommentUpdatedLabel>}
        </CommentHeader>
        <CommentText>{text}</CommentText>
        <EditComment text={text} authorId={userId} commentId={commentId} postId={postId} parentId={parentId} />
        {/*
            TODO:
            Due to design limitation (of course I am working on it..), right now we are not going to allow
            reply to a comment 😛
         */}
        <CommentActions className={cn(id !== userId && !shouldReply ? "hidden" : "")}>
          {shouldReply && <CommentReplyButton />}
          <EditCommentButton authorId={userId} />
        </CommentActions>

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
