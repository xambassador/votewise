import React from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";

import type { GetPostResponse } from "@votewise/types";
import { Avatar, makeToast } from "@votewise/ui";

import { PostAddCommentInput } from "components/post";

import { useCommentMutation } from "lib/hooks/useCommentMutation";
import type { User } from "lib/store";

type PostAddCommentProps = {
  user: User | null;
  post: GetPostResponse["data"]["post"];
};

export function PostAddComment(props: PostAddCommentProps) {
  const { user, post } = props;
  const methods = useForm<{
    text: string;
  }>();
  const text = methods.watch("text");
  const queryClient = useQueryClient();

  function handleError(err: any) {
    const message = err?.response.data.error.message || "Something went wrong";
    makeToast(message, "error");
  }

  const commentMutation = useCommentMutation(text, queryClient, user as User, {
    onSuccess: () => methods.setValue("text", ""),
    onError: handleError,
  });

  const handleOnAddComment = () => {
    commentMutation.mutate(post.id);
  };

  return (
    <div className="flex gap-7">
      <Avatar
        src={user?.profile_image as string}
        width={48}
        height={48}
        rounded
        className="flex-[0_0_48px]"
      />
      <PostAddCommentInput
        placeholder="Add your comment"
        formProps={{
          onSubmit: methods.handleSubmit(handleOnAddComment),
        }}
        isLoading={commentMutation.isLoading}
        disabled={commentMutation.isLoading || post.status === "CLOSED"}
        {...methods.register("text", {
          required: "Comment is required",
        })}
      />
    </div>
  );
}
