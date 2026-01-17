"use client";

import { useRef, useState } from "react";
import { useCreateComment } from "@/hooks/use-create-comment";

import { CommentInput, CommentReplyInput } from "@votewise/ui/cards/comment";
import { Spinner } from "@votewise/ui/ring-spinner";

const spinner = <Spinner className="size-5" />;

type Props = { postId: string };
type CommentInputProps = React.ComponentProps<typeof CommentInput>;
type ReplyToCommentProps = React.ComponentProps<typeof CommentReplyInput> & {
  parentId?: string;
  postId: string;
  username?: string;
};

export function CreateComment(props: Props) {
  const { getInputProps } = useCommentCreation(props);
  return <CommentInput {...getInputProps()} />;
}

export function ReplyToComment(props: ReplyToCommentProps) {
  const { parentId, postId, username, ...rest } = props;
  const { getInputProps } = useCommentCreation({ postId });
  const placeholder = username ? `Reply to @${username}` : "Reply";
  return <CommentReplyInput {...getInputProps({ ...rest, disableFocusIndicator: true, parentId, placeholder })} />;
}

function useCommentCreation(props: Props) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mutation = useCreateComment(props.postId);
  const status = mutation.status;

  function tryToResetError() {
    if (error) setError(null);
  }

  function handleCreateComment(parentId?: string) {
    const value = inputRef.current?.value.trim();
    if (!value) {
      setError("Comment cannot be empty.");
      return;
    }
    mutation.mutate({ text: value, parent_id: parentId });
    inputRef.current!.value = "";
  }

  function getInputProps(props?: CommentInputProps & { parentId?: string }): CommentInputProps {
    const { parentId, ...rest } = props || {};
    return {
      ...rest,
      ref: inputRef,
      disabled: status === "pending",
      disableFocusIndicator: true,
      inputFieldProps: { hasError: !!error },
      buttonProps: {
        onClick: () => handleCreateComment(parentId),
        ...rest?.buttonProps,
        children: status === "pending" ? spinner : rest?.buttonProps?.children,
        disabled: status === "pending" || rest?.buttonProps?.disabled
      },
      onChange: () => tryToResetError()
    };
  }

  return { getInputProps };
}
