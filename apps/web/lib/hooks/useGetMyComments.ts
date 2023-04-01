import type { OrderBy, PostStatus } from "types/post";

import { useInfiniteQuery } from "react-query";

import { getMyComments } from "services/user";

export function useGetMyComments(status: PostStatus, orderBy: OrderBy) {
  return useInfiniteQuery(
    ["my-comments", status, orderBy],
    ({ pageParam = 0 }) => getMyComments(status, orderBy, 5, pageParam || 0),
    {
      getNextPageParam: (lastPage) =>
        lastPage.data.meta.pagination.isLastPage ? undefined : lastPage.data.meta.pagination.next,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );
}
