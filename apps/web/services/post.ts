import type { AxiosResponse } from "axios";

import type {
  CreateCommentResponse,
  GetPostResponse,
  GetPostsResponse,
  LikePostResponse,
  UnLikePostResponse,
} from "@votewise/types";

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
  const apiEndpoint = `/posts/${postId}/like`;
  const response: AxiosResponse<LikePostResponse> = await axioInstance.patch(apiEndpoint, {
    postId,
    type: "LIKE",
  });
  return response.data;
};

/**
 * @description Unlike post
 */
export const unlikePost = async (postId: number) => {
  const apiEndpoint = `/posts/${postId}/unlike`;
  const response: AxiosResponse<UnLikePostResponse> = await axioInstance.patch(apiEndpoint, {
    postId,
    type: "UNLIKE",
  });
  return response.data;
};

/**
 * @description Comment on post
 */
export const commentOnPost = async (postId: number, comment: string) => {
  const apiEndpoint = `/posts/${postId}/comment`;
  const response: AxiosResponse<CreateCommentResponse> = await axioInstance.post(apiEndpoint, {
    postId,
    text: comment,
  });
  return response.data;
};
