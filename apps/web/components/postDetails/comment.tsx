import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";

import type { GetPostCommentsResponse, GetPostResponse } from "@votewise/types";
import { AnimatedList, Avatar, Spinner, makeToast } from "@votewise/ui";
import { FiXCircle as XCircle } from "@votewise/ui/icons";

import { CommentReplies } from "@/components/postDetails/replies";
import { ButtonGroup } from "components";
import { PostAddCommentInput } from "components/post";
import {
  Comment,
  CommentActions,
  CommentBody,
  CommentHeader,
  CommentSeparator,
  CommentText,
} from "components/post/comments";

import { timeAgo } from "lib/date";
import { useDeleteCommentMutation } from "lib/hooks/useDeleteCommentMutation";
import { useLikeCommentMutation } from "lib/hooks/useLikeCommentMutation";
import { useReplyToCommentMutation } from "lib/hooks/useReplyToCommentMutation";
import { useUnLikeCommentMutation } from "lib/hooks/useUnlikCommentMutation";
import { useUpdateCommentMutation } from "lib/hooks/useUpdateCommentMutation";
import type { User } from "lib/store";

import { DropDown } from "./dropDown";

type PostCommentProps = {
  comment: GetPostCommentsResponse["data"]["comments"][0];
  user: User | null;
  postId: number;
};

export function PostComment(props: PostCommentProps) {
  const { user, comment, postId } = props;
  const [toggle, setToggle] = useState(false);
  const [toggleReply, setToggleReply] = useState(false);
  const methods = useForm<{
    text: string;
    reply: string;
  }>({
    defaultValues: {
      text: comment.text,
    },
  });
  const queryClient = useQueryClient();

  const updateCommentMutation = useUpdateCommentMutation(queryClient, {
    onSuccess: () => {
      setToggle(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Something went wrong";
      makeToast(msg, "error");
    },
  });

  const replyToCommentMutation = useReplyToCommentMutation(queryClient, {
    onSuccess: () => methods.setValue("reply", ""),
  });

  const likeCommentMutation = useLikeCommentMutation(queryClient, {
    onSuccess: () => {},
    onError: (error) => {
      const msg = error?.response?.data?.message || "Something went wrong";
      makeToast(msg, "error");
    },
  });

  const unLikeCommentMutation = useUnLikeCommentMutation(queryClient, {
    onSuccess: () => {},
    onError: (error) => {
      const msg = error?.response?.data?.message || "Something went wrong";
      makeToast(msg, "error");
    },
  });

  const deleteCommentMutation = useDeleteCommentMutation(queryClient, {
    onSuccess: () => {
      // TODO: Should this optimisic update move to hook itself ????
      queryClient.setQueryData<GetPostResponse>(["post", postId], (old) => ({
        ...(old as GetPostResponse),
        data: {
          ...old?.data,
          post: {
            ...old?.data?.post,
            comments_count: old?.data ? old.data.post.comments_count - 1 : 0,
          },
        } as GetPostResponse["data"],
      }));
      makeToast(`Your comment "${comment.text}" is deleted successfully.`, "success");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "Something went wrong";
      makeToast(msg, "error");
    },
  });

  const handleOnDropDownItemClick = (action: "DELETE" | "UPDATE") => {
    if (action === "UPDATE") {
      setToggle(true);
      return;
    }

    deleteCommentMutation.mutate({
      postId,
      commentId: comment.id,
    });
  };

  const handleOnCommentUpdate = (data: { text: string }) => {
    updateCommentMutation.mutate({
      postId,
      commentId: comment.id,
      comment: data.text,
    });
  };

  const handleOnReplyComment = (data: { reply: string }) => {
    replyToCommentMutation.mutate({
      postId,
      commentId: comment.id,
      comment: data.reply,
    });
  };

  const handleOnLikeComment = () => {
    if (comment.upvotes.find((upvote) => upvote.user_id === user?.id)) {
      unLikeCommentMutation.mutate({
        postId,
        commentId: comment.id,
        user: user as User,
      });
      return;
    }
    likeCommentMutation.mutate({
      postId,
      commentId: comment.id,
      user: user as User,
    });
  };

  return (
    <Comment>
      <CommentHeader>
        <Avatar src={comment.user.profile_image} width={48} height={48} rounded className="flex-[0_0_48px]" />
        <span className="text-base font-medium text-gray-800">{comment.user.name}</span>
        <span className="text-sm text-gray-600">{timeAgo(comment.updated_at)}</span>

        {user?.id === comment.user_id &&
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
          {!toggle && <CommentText>{comment.text}</CommentText>}
          {toggle && (
            <PostAddCommentInput
              className="w-full"
              placeholder="Add your comment"
              isLoading={updateCommentMutation.isLoading}
              disabled={updateCommentMutation.isLoading}
              formProps={{ className: "mb-2", onSubmit: methods.handleSubmit(handleOnCommentUpdate) }}
              {...methods.register("text")}
            />
          )}
          <CommentActions
            upvoteText={comment.upvotes_count}
            upvoteIconProps={{
              className: comment.upvotes.find((upvote) => upvote.user_id === user?.id) ? "text-blue-500" : "",
            }}
            upvoteButtonProps={{
              onClick: handleOnLikeComment,
            }}
            replyText={comment.num_replies}
            replyButtonProps={{
              onClick: () => setToggleReply(!toggleReply),
            }}
          >
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
          </CommentActions>
          <AnimatedList>
            {toggleReply && (
              <>
                {comment.num_replies > 0 && (
                  <CommentReplies postId={postId} commentId={comment.id} user={user} />
                )}
                <PostAddCommentInput
                  className="w-full"
                  placeholder={`Reply to ${comment.user.name} ...`}
                  isLoading={replyToCommentMutation.isLoading}
                  disabled={replyToCommentMutation.isLoading}
                  formProps={{ onSubmit: methods.handleSubmit(handleOnReplyComment) }}
                  {...methods.register("reply")}
                />
              </>
            )}
          </AnimatedList>
        </div>
      </CommentBody>
    </Comment>
  );
}
