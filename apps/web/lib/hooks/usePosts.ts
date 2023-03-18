import { useQuery } from "react-query";

import type { GetPostsResponse } from "@votewise/types";

import { getPosts } from "services/post";

export const usePosts = (initialData: GetPostsResponse) => {
  const postsQuery = useQuery("posts", getPosts, {
    initialData,
  });
  return postsQuery;
};
