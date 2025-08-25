"use client";

import { useDeleteComment } from "@/hooks/use-delete-comment";

import { CommentDeleteButton } from "@votewise/ui/cards/comment";
import { Spinner } from "@votewise/ui/ring-spinner";
import { makeToast } from "@votewise/ui/toast";

import { useMe } from "@/components/user-provider";

type Props = {
  feedId: string;
  commentId: string;
  authorId: string;
  parentId?: string;
};

export function DeleteCommentButton(props: Props) {
  const { authorId, commentId, feedId, parentId } = props;
  const { id } = useMe("DeleteButton");
  const { mutate, isPending } = useDeleteComment(feedId, commentId, parentId);
  if (id !== authorId) return null;
  return (
    <CommentDeleteButton
      onClick={() =>
        mutate(undefined, {
          onError: (err) => {
            makeToast.error("Oops!", err.message);
          }
        })
      }
      disabled={isPending}
      aria-label="Delete comment"
      {...(isPending
        ? {
            "aria-busy": true,
            "aria-live": "polite",
            "aria-atomic": true,
            leftSlot: <Spinner className="size-5" />
          }
        : {})}
    >
      Delete
    </CommentDeleteButton>
  );
}
