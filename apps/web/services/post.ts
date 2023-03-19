import type { AxiosResponse } from "axios";

import type { GetPostsResponse } from "@votewise/types";

import { axioInstance } from "lib/axios";

/**
 * @description Get all posts
 * @returns
 */
export const getPosts = async (limit = 5, offset = 0) => {
  const apiEndpoint = `/posts?limit=${limit}&offset=${offset}`;
  const response: AxiosResponse<GetPostsResponse> = await axioInstance.get(apiEndpoint);
  return response.data;
};
