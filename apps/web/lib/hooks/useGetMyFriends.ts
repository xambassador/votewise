import { useInfiniteQuery } from "react-query";

import { getMyFriends } from "services/user";

export function useGetMyFriends() {
  return useInfiniteQuery(["my-friends"], ({ pageParam = 0 }) => getMyFriends(5, pageParam || 0), {
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.pagination.isLastPage ? undefined : lastPage.data.meta.pagination.next,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}
