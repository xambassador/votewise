"use client";

import { useRef, useState } from "react";
import { useCreateComment } from "@/hooks/use-create-comment";

import { CommentInput } from "@votewise/ui/cards/comment";
import { Spinner } from "@votewise/ui/ring-spinner";
import { makeToast } from "@votewise/ui/toast";

const spinner = <Spinner className="size-5" />;

type Props = { postId: string };
type CommentInputProps = React.ComponentProps<typeof CommentInput>;

export function CreateComment(props: Props) {
  const { getInputProps } = useCreateCommentBase(props);
  return <CommentInput {...getInputProps()} />;
}

function useCreateCommentBase(props: Props) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mutation = useCreateComment(props.postId);
  const status = mutation.status;

  function tryToResetError() {
    if (error) setError(null);
  }

  function handleCreateComment() {
    const value = inputRef.current?.value.trim();
    if (!value) {
      setError("Comment cannot be empty.");
      return;
    }
    mutation.mutate(
      { text: value },
      { onError: (err) => makeToast.error("Oops! Failed to create comment.", err.message) }
    );
    inputRef.current!.value = "";
  }

  function getInputProps(props?: CommentInputProps): CommentInputProps {
    return {
      ...props,
      ref: inputRef,
      disabled: status === "pending",
      disableFocusIndicator: true,
      inputFieldProps: { hasError: !!error },
      buttonProps: {
        onClick: handleCreateComment,
        ...props?.buttonProps,
        children: status === "pending" ? spinner : props?.buttonProps?.children,
        disabled: status === "pending" || props?.buttonProps?.disabled
      },
      onChange: () => tryToResetError()
    };
  }

  return { getInputProps };
}
