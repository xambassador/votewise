import React from "react";

import { AnimatedList, Button } from "@votewise/ui";

import { CommentsWrapper } from "components/post/comments";

import { useGetComments } from "lib/hooks/useGetComments";
import type { User } from "lib/store";

import { PostComment } from "./comment";

type PostCommentsProps = {
  user: User | null;
  postId: number;
};

export function PostComments(props: PostCommentsProps) {
  const { user, postId } = props;
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useGetComments(postId);

  return (
    <CommentsWrapper>
      {(status !== "loading" || !isFetching) &&
        data?.pages.map((page, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={i}>
            <AnimatedList>
              {page.data.comments.length === 0 && (
                <div>
                  <h2 className="text-center text-lg font-semibold text-gray-600">No comments yet</h2>
                </div>
              )}
              {page.data.comments.length > 0 &&
                page.data.comments.map((c) => (
                  <PostComment key={c.id} comment={c} user={user} postId={postId} />
                ))}
            </AnimatedList>
          </React.Fragment>
        ))}
      {hasNextPage && (
        <Button
          className="bg-gray-800 py-3 text-gray-50 disabled:bg-gray-800"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          isLoading={isFetchingNextPage || isFetching}
        >
          {hasNextPage && "Load more discussions"}
          {!hasNextPage && "No more discussions"}
        </Button>
      )}
    </CommentsWrapper>
  );
}
