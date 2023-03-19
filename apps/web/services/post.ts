import type { AxiosResponse } from "axios";

import type { GetPostResponse, GetPostsResponse, LikePostResponse } from "@votewise/types";

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

/**
 * @description Get post details
 */
export const getPost = async (postId: number) => {
  const apiEndpoint = `/posts/${postId}`;
  const response: AxiosResponse<GetPostResponse> = await axioInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Like post
 */

export const likePost = async (postId: number) => {
  const apiEndpoint = "/posts/like";
  const response: AxiosResponse<LikePostResponse> = await axioInstance.patch(apiEndpoint, {
    postId,
    type: "LIKE",
  });
  return response.data;
};
