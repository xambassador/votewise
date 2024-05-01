import { useInfiniteQuery } from "react-query";
import { getReplies } from "services/post";

/**
 * @description This hook is used to fetch replies for a comment
 * @param postId Post id for which replies are to be fetched
 * @param commentId Comment id for which replies are to be fetched
 * @returns
 */
export function useGetReplies(postId: number, commentId: number) {
  return useInfiniteQuery(
    ["replies", postId, commentId],
    ({ pageParam = 0 }) => getReplies(postId, commentId, 5, pageParam),
    {
      getNextPageParam: (lastPage) =>
        lastPage.data.meta.pagination.isLastPage ? undefined : lastPage.data.meta.pagination.next,
    }
  );
}
