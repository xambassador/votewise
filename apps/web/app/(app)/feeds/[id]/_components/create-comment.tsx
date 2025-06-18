"use client";

import type { AsyncState } from "@votewise/types";

import { useRef, useState } from "react";

import { CommentInput } from "@votewise/ui/cards/comment";
import { Spinner } from "@votewise/ui/ring-spinner";
import { makeToast } from "@votewise/ui/toast";

import { commentClient } from "@/lib/client";

const spinner = <Spinner className="size-5" />;

export function CreateComment(props: { postId: string }) {
  const valueRef = useRef<string | null>(null);
  const [status, setStatus] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleCreateComment() {
    if (!valueRef.current) {
      setError("Comment cannot be empty.");
      return;
    }
    setStatus("loading");
    const res = await commentClient.createComment(props.postId, {
      text: valueRef.current
    });
    if (!res.success) {
      makeToast.error("Oops! Failed to create comment.", res.error);
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  return (
    <CommentInput
      buttonProps={{
        onClick: handleCreateComment,
        children: status === "loading" ? spinner : null,
        disabled: status === "loading"
      }}
      disabled={status === "loading"}
      inputFieldProps={{ hasError: !!error }}
      onChange={(e) => {
        valueRef.current = e.target.value;
        if (error) setError(null);
      }}
    />
  );
}
