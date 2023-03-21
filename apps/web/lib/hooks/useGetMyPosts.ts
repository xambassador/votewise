import { useInfiniteQuery } from "react-query";

import { getMyPosts } from "services/user";

/**
 * @description Get my posts.
 * @returns
 */
export function useGetMyPosts(status: "open" | "closed" | "archived" | "inprogress" = "open") {
  return useInfiniteQuery(["my-posts", status], ({ pageParam = 0 }) => getMyPosts(5, pageParam, status), {
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.pagination.isLastPage ? undefined : lastPage.data.meta.pagination.next,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
