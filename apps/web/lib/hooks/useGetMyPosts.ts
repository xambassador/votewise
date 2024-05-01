import type { OrderBy, PostStatus } from "types/post";

import { useInfiniteQuery } from "react-query";
import { getMyPosts } from "services/user";

/**
 * @description Get my posts.
 * @returns
 */
export function useGetMyPosts(
  status: PostStatus = "open",
  orderBy: OrderBy = "desc",
  options?: {
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
    onSettled?: () => void;
  }
) {
  return useInfiniteQuery(
    ["my-posts", status, orderBy],
    ({ pageParam = 0 }) => getMyPosts(5, pageParam || 0, status, orderBy),
    {
      getNextPageParam: (lastPage) =>
        lastPage.data.meta.pagination.isLastPage ? undefined : lastPage.data.meta.pagination.next,
      refetchOnWindowFocus: options?.refetchOnWindowFocus || false,
      refetchOnMount: options?.refetchOnMount || false,
      onSettled: () => {
        options?.onSettled?.();
      },
    }
  );
}
