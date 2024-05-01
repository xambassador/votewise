import type { GetPostCommentsResponse, GetRepliesResponse } from "@votewise/types";
import type { User } from "lib/store";
import type { InfiniteData } from "react-query";

import React, { useState } from "react";
import { ButtonGroup } from "components";
import { PostAddCommentInput } from "components/post";
import { Comment, CommentBody, CommentHeader, CommentSeparator, CommentText } from "components/post/comments";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";

import { Avatar, makeToast, Spinner } from "@votewise/ui";
import { FiXCircle as XCircle } from "@votewise/ui/icons";

import { timeAgo } from "lib/date";
import { useDeleteCommentMutation } from "lib/hooks/useDeleteCommentMutation";
import { useUpdateCommentMutation } from "lib/hooks/useUpdateCommentMutation";

import { DropDown } from "./dropDown";

type CommentReplyProps = {
  postId: number;
  reply: GetRepliesResponse["data"]["replies"][0];
  user: User | null;
  commentId: number;
};

/**
 * @description Renders a single comment reply
 */
export function CommentReply(props: CommentReplyProps) {
  const { reply, user, postId, commentId } = props;
  const [toggle, setToggle] = useState(false);
  const methods = useForm<{
    text: string;
  }>({
    defaultValues: {
      text: reply.text,
    },
  });
  const queryClient = useQueryClient();

  const updateCommentMutation = useUpdateCommentMutation(queryClient, {
    onSuccess: () => {
      setToggle(false);
    },
    onMutate: (data) => {
      queryClient.cancelQueries(["replies", postId, commentId]);
      const previousReplies = queryClient.getQueryData<InfiniteData<GetRepliesResponse>>([
        "replies",
        postId,
        commentId,
      ]);
      queryClient.setQueryData<InfiniteData<GetRepliesResponse>>(["replies", postId, commentId], (old) => ({
        ...(old as InfiniteData<GetRepliesResponse>),
        pages: old?.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            replies: page.data.replies.map((r) => {
              if (r.id === reply.id) {
                return {
                  ...r,
                  text: data.comment,
                  updated_at: new Date(),
                };
              }
              return r;
            }),
          },
        })) as GetRepliesResponse[],
      }));
      return { previousData: previousReplies };
    },
    onError: (error, _, context) => {
      const msg = error?.response?.data?.message || "Something went wrong";
      makeToast(msg, "error");
      if (context?.previousData) {
        queryClient.setQueryData<InfiniteData<GetRepliesResponse>>(
          ["replies", postId, commentId],
          context.previousData
        );
      }
    },
  });

  const deleteCommentMutation = useDeleteCommentMutation(queryClient, {
    onMutate: () => {
      queryClient.cancelQueries(["comments", postId]);
      queryClient.cancelQueries(["replies", postId, commentId]);
      const previousComments = queryClient.getQueryData<InfiniteData<GetPostCommentsResponse>>([
        "comments",
        postId,
      ]);
      const previousData = queryClient.getQueryData<InfiniteData<GetRepliesResponse>>([
        "replies",
        postId,
        commentId,
      ]);
      queryClient.setQueryData<InfiniteData<GetPostCommentsResponse>>(["comments", postId], (old) => ({
        ...(old as InfiniteData<GetPostCommentsResponse>),
        pages: old?.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            comments: page.data.comments.map((c) => {
              if (c.id === commentId) {
                return {
                  ...c,
                  num_replies: c.num_replies - 1,
                };
              }
              return c;
            }),
          },
        })) as GetPostCommentsResponse[],
      }));
      queryClient.setQueryData<InfiniteData<GetRepliesResponse>>(["replies", postId, commentId], (old) => ({
        ...(old as InfiniteData<GetRepliesResponse>),
        pages: old?.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            replies: page.data.replies.filter((r) => r.id !== reply.id),
          },
        })) as GetRepliesResponse[],
      }));

      makeToast(`Your comment "${reply.text}" is deleted successfully.`, "success");
      return { previousData, previousComments };
    },
    onSuccess: () => {},
    onError: (error, _, context) => {
      const msg = error?.response?.data?.message || "Something went wrong";
      makeToast(msg, "error");
      if (context?.previousData) {
        queryClient.setQueryData<InfiniteData<GetRepliesResponse>>(
          ["replies", postId, commentId],
          context.previousData
        );
      }
      if (context?.previousComments) {
        queryClient.setQueryData<InfiniteData<GetPostCommentsResponse>>(
          ["comments", postId],
          context.previousComments
        );
      }
    },
  });

  const handleOnDropDownItemClick = (action: "DELETE" | "UPDATE") => {
    if (action === "UPDATE") {
      setToggle(true);
      return;
    }

    deleteCommentMutation.mutate({
      postId,
      commentId: reply.id,
    });
  };

  const handleOnReplyUpdate = (data: { text: string }) => {
    updateCommentMutation.mutate({
      postId,
      commentId: reply.id,
      comment: data.text,
    });
  };

  return (
    <Comment key={reply.id} className="py-4">
      <CommentHeader>
        <Avatar src={reply.user.profile_image} width={48} height={48} rounded className="flex-[0_0_48px]" />
        <span className="text-base font-medium text-gray-800">{reply.user.name}</span>
        <span className="text-sm text-gray-600">{timeAgo(reply.updated_at)}</span>

        {user?.id === reply.user.id &&
          (!deleteCommentMutation.isLoading ? (
            <DropDown onDropDownItemClick={handleOnDropDownItemClick} />
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-600">Removing comment</span>
              <Spinner className="h-5 w-5" />
            </div>
          ))}
      </CommentHeader>

      <CommentBody>
        <CommentSeparator />
        <div className="ml-3 flex w-full flex-col gap-2">
          {!toggle && <CommentText>{reply.text}</CommentText>}
          {toggle && (
            <PostAddCommentInput
              className="w-full"
              placeholder="Add your comment"
              isLoading={updateCommentMutation.isLoading}
              disabled={updateCommentMutation.isLoading}
              formProps={{ className: "mb-2", onSubmit: methods.handleSubmit(handleOnReplyUpdate) }}
              {...methods.register("text")}
            />
          )}
          {toggle && (
            <ButtonGroup>
              <button type="button" className="flex items-center gap-1" onClick={() => setToggle(false)}>
                <span>
                  <XCircle className="h-5 w-5 text-gray-500" />
                </span>
                <span className="text-sm text-gray-600">Cancel</span>
              </button>
            </ButtonGroup>
          )}
        </div>
      </CommentBody>
    </Comment>
  );
}
