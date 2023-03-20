import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAxiosServerWithAuth } from "server/lib/axios";

import {
  COMMENT_ON_POST_V1,
  GET_POSTS_V1,
  GET_POST_COMMENTS_V1,
  GET_POST_V1,
  LIKE_POST_V1,
  POST_ROUTE_V1,
  UNLIKE_POST_V1,
} from "@votewise/lib";
import type {
  CreateCommentResponse,
  GetPostCommentsResponse,
  GetPostResponse,
  GetPostsResponse,
  LikePostResponse,
  UnLikePostResponse,
} from "@votewise/types";

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
 * @description Unlike a post
 */
export const unlikePost = async (
  token: string,
  postId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${UNLIKE_POST_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<UnLikePostResponse> = await getAxiosServerWithAuth(token).delete(
    apiEndpoint,
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

/**
 * @description Comment on post
 */
export const commentOnPost = async (
  token: string,
  postId: number,
  comment: string,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${COMMENT_ON_POST_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<CreateCommentResponse> = await getAxiosServerWithAuth(token).post(
    apiEndpoint,
    {
      text: comment,
    },
    {
      headers: options?.headers,
    }
  );

  return response;
};

/**
 * @description Get post comments
 */
export const getPostComments = async (
  token: string,
  postId: number,
  limit: number,
  offset: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${POST_ROUTE_V1}${GET_POST_COMMENTS_V1}`.replace(":postId", postId.toString());
  const response: AxiosResponse<GetPostCommentsResponse> = await getAxiosServerWithAuth(token).get(
    apiEndpoint,
    {
      headers: options?.headers,
      params: {
        limit,
        offset,
      },
    }
  );
  return response;
};
