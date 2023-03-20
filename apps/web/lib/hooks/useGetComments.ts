import { useInfiniteQuery } from "react-query";

import { getCommentsForPost } from "services/post";

/**
 * @description Get comments for a post
 * @param postId Post ID to get comments for
 * @returns
 */
export const useGetComments = (postId: number) =>
  useInfiniteQuery(["comments", postId], ({ pageParam = 0 }) => getCommentsForPost(postId, 5, pageParam), {
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.pagination.isLastPage ? undefined : lastPage.data.meta.pagination.next,
    refetchOnMount: false,
  });
