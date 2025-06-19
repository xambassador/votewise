"use client";

import type { CreateCommentResponse } from "@votewise/client/comment";
import type { AsyncState } from "@votewise/types";

import { useRef, useState } from "react";

import { CommentInput } from "@votewise/ui/cards/comment";
import { Spinner } from "@votewise/ui/ring-spinner";
import { makeToast } from "@votewise/ui/toast";

import { commentClient } from "@/lib/client";

const spinner = <Spinner className="size-5" />;

type Props = { postId: string; onCommentCreated?: (data: CreateCommentResponse & { text: string }) => void };

export function CreateComment(props: Props) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [status, setStatus] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleCreateComment() {
    const value = inputRef.current?.value.trim();
    if (!value) {
      setError("Comment cannot be empty.");
      return;
    }
    setStatus("loading");
    const res = await commentClient.createComment(props.postId, { text: value });
    if (!res.success) {
      makeToast.error("Oops! Failed to create comment.", res.error);
      setStatus("error");
      return;
    }
    setStatus("success");
    props.onCommentCreated?.({ ...res.data, text: value });
    inputRef.current!.value = "";
  }

  return (
    <CommentInput
      ref={inputRef}
      buttonProps={{
        onClick: handleCreateComment,
        children: status === "loading" ? spinner : null,
        disabled: status === "loading"
      }}
      disabled={status === "loading"}
      inputFieldProps={{ hasError: !!error }}
      onChange={() => {
        if (error) setError(null);
      }}
    />
  );
}
