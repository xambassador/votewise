"use client";

import { useDeleteComment } from "@/hooks/use-delete-comment";

import { CommentDeleteButton } from "@votewise/ui/cards/comment";
import { Spinner } from "@votewise/ui/ring-spinner";

import { useMe } from "@/components/user-provider";

type Props = {
  feedId: string;
  commentId: string;
  authorId: string;
  parentId?: string;
} & React.ComponentProps<typeof CommentDeleteButton>;

export function DeleteCommentButton(props: Props) {
  const { authorId, commentId, feedId, parentId, ...rest } = props;
  const { id } = useMe("DeleteButton");
  const { mutate, isPending } = useDeleteComment(feedId, commentId, parentId);
  const isDisabled = isPending || rest.disabled;
  if (id !== authorId) return null;
  return (
    <CommentDeleteButton
      {...rest}
      onClick={() => mutate(undefined)}
      disabled={isDisabled}
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
      <span className="hidden sm:inline-block">Delete</span>
    </CommentDeleteButton>
  );
}
