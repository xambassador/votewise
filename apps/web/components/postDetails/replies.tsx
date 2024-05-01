import type { User } from "lib/store";

import React from "react";

import { Button, Spinner } from "@votewise/ui";

import { useGetReplies } from "lib/hooks/useGetReplies";

import { CommentReply } from "./reply";

type CommentRepliesProps = {
  postId: number;
  commentId: number;
  user: User | null;
};

/**
 * @description Renders a list of comment replies
 */
export function CommentReplies(props: CommentRepliesProps) {
  const { postId, commentId, user } = props;
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useGetReplies(
    postId,
    commentId
  );

  return status === "loading" ? (
    <div className="flex items-center justify-center gap-2 py-5">
      <span className="font-semibold text-gray-600">Loading Replies</span>
      <Spinner className="h-5 w-5" />
    </div>
  ) : (
    <>
      {data?.pages.map((page, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={i}>
          {page.data.replies.map((reply) => (
            <CommentReply key={reply.id} postId={postId} reply={reply} user={user} commentId={commentId} />
          ))}
        </React.Fragment>
      ))}

      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          isLoading={isFetchingNextPage || isFetching}
        >
          Load more comments
        </Button>
      )}
    </>
  );
}
