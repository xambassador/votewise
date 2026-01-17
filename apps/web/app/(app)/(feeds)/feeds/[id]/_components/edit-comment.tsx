"use client";

import { useRef, useState } from "react";
import { useEditComment } from "@/hooks/use-edit-comment";

import { CommentEditButton, CommentEditInput, useComment } from "@votewise/ui/cards/comment";
import { Spinner } from "@votewise/ui/ring-spinner";

import { useMe } from "@/components/user-provider";

type CommentInputProps = React.ComponentProps<typeof CommentEditInput>;
type Props = {
  text: string;
  authorId: string;
  postId: string;
  commentId: string;
  parentId?: string;
};

const spinner = <Spinner className="size-5" />;

export function EditComment(props: Props) {
  const { id } = useMe("EditComment");
  const { getInputProps } = useUpdateComment(props);
  if (id !== props.authorId) return null;
  return <CommentEditInput {...getInputProps({ disableFocusIndicator: true })} />;
}

export function EditCommentButton(props: React.ComponentProps<typeof CommentEditButton> & { authorId: string }) {
  const { authorId, ...rest } = props;
  const { id } = useMe("EditButton");
  if (id !== authorId) return null;
  return <CommentEditButton {...rest} />;
}

function useUpdateComment(props: Props) {
  const { commentId, postId, text, parentId } = props;
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mutation = useEditComment(postId, commentId, parentId);
  const { toggle } = useComment("useUpdateComment");
  const status = mutation.status;

  function tryToResetError() {
    if (error) setError(null);
  }

  function handleUpdateComment() {
    const value = inputRef.current?.value.trim();
    if (!value) {
      setError("Comment cannot be empty.");
      return;
    }
    if (value === text) {
      toggle?.(true);
      return;
    }

    mutation.mutate({ text: value });
    toggle?.(true);
  }

  function getInputProps(props?: CommentInputProps): CommentInputProps {
    const { ...rest } = props || {};
    return {
      defaultValue: text,
      ...rest,
      ref: inputRef,
      disabled: status === "pending",
      disableFocusIndicator: true,
      inputFieldProps: { hasError: !!error },
      buttonProps: {
        onClick: () => handleUpdateComment(),
        ...rest?.buttonProps,
        children: status === "pending" ? spinner : rest?.buttonProps?.children,
        disabled: status === "pending" || rest?.buttonProps?.disabled
      },
      onChange: () => tryToResetError()
    };
  }

  return { getInputProps };
}
