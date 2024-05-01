import { useInfiniteQuery } from "react-query";
import { getPosts } from "services/post";

const fetchPosts = async ({ pageParam = 0 }) => {
  const response = await getPosts(5, pageParam || 0);
  return response;
};

/**
 * @description This hook is used to fetch posts with pagination
 * @returns
 */
export const usePosts = () => {
  const postsQuery = useInfiniteQuery("posts", fetchPosts, {
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.pagination.isLastPage ? undefined : lastPage.data.meta.pagination.next,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return postsQuery;
};
