import { useInfiniteQuery } from "react-query";

import { getReplies } from "services/post";

export function useGetReplies(postId: number, commentId: number) {
  return useInfiniteQuery(
    ["replies", postId, commentId],
    ({ pageParams = 0 }) => getReplies(postId, commentId, 5, pageParams),
    {
      getNextPageParam: (lastPage) =>
        lastPage.data.meta.pagination.isLastPage ? undefined : lastPage.data.meta.pagination.next,
    }
  );
}
