import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAxiosServerWithAuth } from "server/lib/axios";

import { GET_POSTS_V1, GET_POST_V1, LIKE_POST_V1, POST_ROUTE_V1 } from "@votewise/lib";
import type { GetPostResponse, GetPostsResponse, LikePostResponse } from "@votewise/types";

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

/**
 * @description Like a post
 */
export const likePost = async (
  token: string,
  postId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${LIKE_POST_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<LikePostResponse> = await getAxiosServerWithAuth(token).patch(
    apiEndpoint,
    {},
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Get post details
 */
export const getPost = async (
  token: string,
  postId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${GET_POST_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<GetPostResponse> = await getAxiosServerWithAuth(token).get(apiEndpoint, {
    headers: options?.headers,
  });
  return response;
};
