import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAxiosServerWithAuth } from "server/lib/axios";

import { GET_POSTS_V1, POST_ROUTE_V1 } from "@votewise/lib";
import type { GetPostsResponse } from "@votewise/types";

/**
 * @description Get all posts
 * @param token Access token
 */
export const getPosts = async (
  token: string,
  limit: number,
  offset: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${GET_POSTS_V1}?limit=${limit}&offset=${offset}`;
  const response: AxiosResponse<GetPostsResponse> = await getAxiosServerWithAuth(token).get(apiEndpoint, {
    headers: options?.headers,
  });
  return response;
};
