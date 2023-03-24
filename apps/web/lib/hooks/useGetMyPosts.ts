import { useInfiniteQuery } from "react-query";

import { getMyPosts } from "services/user";

/**
 * @description Get my posts.
 * @returns
 */
type OrderBy = "asc" | "desc";
type PostStatus = "open" | "closed" | "archived" | "inprogress";
export function useGetMyPosts(status: PostStatus = "open", orderBy: OrderBy = "desc") {
  return useInfiniteQuery(
    ["my-posts", status, orderBy],
    ({ pageParam = 0 }) => getMyPosts(5, pageParam || 0, status, orderBy),
    {
      getNextPageParam: (lastPage) =>
        lastPage.data.meta.pagination.isLastPage ? undefined : lastPage.data.meta.pagination.next,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
}
