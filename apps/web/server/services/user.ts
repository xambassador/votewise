import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAxiosServerWithAuth } from "server/lib/axios";

import {
  DELETE_POST_V1,
  GET_ME_V1,
  UPDATE_POST_STATUS_V1,
  USER_CREATE_POST_V1,
  USER_GET_COMMENTS_V1,
  USER_GET_FRIENDS_V1,
  USER_GET_POSTS_V1,
  USER_ROUTE_V1,
  USER_UPDATE_POST_V1,
} from "@votewise/lib";
import type {
  CreatePostPayload,
  CreatePostResponse,
  DeletePostResponse,
  GetFriendsResponse,
  GetMyCommentsResponse,
  GetMyPostsResponse,
  MyDetailsResponse,
  PostStatus,
  UpdatePostPayload,
  UpdatePostResponse,
  UpdatePostStatusResponse,
} from "@votewise/types";

/**
 * @description Get details of the logged in user
 * @param token Access token
 * @param options Axios options
 * @returns
 */
export const getMyDetails = async (
  token: string,
  options: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${USER_ROUTE_V1}${GET_ME_V1}`;
  const response: AxiosResponse<MyDetailsResponse> = await getAxiosServerWithAuth(token).get(apiEndpoint, {
    headers: options.headers,
  });
  return response;
};

/**
 * @description Create a new post
 * @param payload Post payload
 * @param token Access token
 */
export const createPost = async (
  payload: CreatePostPayload,
  token: string,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${USER_ROUTE_V1}${USER_CREATE_POST_V1}`;
  const response: AxiosResponse<CreatePostResponse> = await getAxiosServerWithAuth(token).post(
    apiEndpoint,
    payload,
    {
      headers: options?.headers,
    }
  );
  return response;
};

type OrderBy = "asc" | "desc";
/**
 * @description Get all posts created by the curent logged in user
 * @param token Access token
 * @param limit Limit of posts to fetch. Default is 5
 * @param offset Offset of posts to fetch. Default is 0
 * @param options Axios options
 */
export const getMyPosts = async (
  token: string,
  limit = 5,
  offset = 0,
  status: "open" | "closed" | "archived" | "inprogress" = "open",
  orderBy: OrderBy = "desc",
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${USER_ROUTE_V1}${USER_GET_POSTS_V1}?limit=${limit}&offset=${offset}&status=${status}&orderBy=${orderBy}`;
  const response: AxiosResponse<GetMyPostsResponse> = await getAxiosServerWithAuth(token).get(apiEndpoint, {
    headers: options?.headers,
  });
  return response;
};

/**
 * @description Update post
 * @param token Access token
 * @param postId Post id
 * @param payload Payload to update post
 * @param options Axios Request options
 * @returns
 */
export const updatePost = async (
  token: string,
  postId: number,
  payload: UpdatePostPayload,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${USER_ROUTE_V1}${USER_UPDATE_POST_V1}`.replace(":postId", String(postId));
  const response: AxiosResponse<UpdatePostResponse> = await getAxiosServerWithAuth(token).patch(
    apiEndpoint,
    payload,
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Delete post
 * @param token Access token
 * @param postId Post id
 * @param options Axios Request options
 * @returns
 */
export const deletePost = async (
  token: string,
  postId: number,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${USER_ROUTE_V1}${DELETE_POST_V1}`.replace(":postId", String(postId));
  const response: AxiosResponse<DeletePostResponse> = await getAxiosServerWithAuth(token).delete(
    apiEndpoint,
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Update post status
 * @param token Access token
 * @param postId Post id
 * @param status Status to update
 * @param options
 * @returns
 */
export const updatePostStatus = async (
  token: string,
  postId: number,
  status: PostStatus,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${USER_ROUTE_V1}${UPDATE_POST_STATUS_V1}`.replace(":postId", String(postId));
  const response: AxiosResponse<UpdatePostStatusResponse> = await getAxiosServerWithAuth(token).patch(
    apiEndpoint,
    { status },
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Get comments created by the current logged in user
 * @param token Access token
 * @param limit Limit to fetch comments
 * @param offset Offset to fetch comments
 * @param options Option
 * @returns
 */
export const getMyComments = async (
  token: string,
  status: PostStatus,
  orderBy: OrderBy,
  limit = 5,
  offset = 0,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${USER_ROUTE_V1}${USER_GET_COMMENTS_V1}?limit=${limit}&offset=${offset}&status=${status}&orderBy=${orderBy}`;
  const response: AxiosResponse<GetMyCommentsResponse> = await getAxiosServerWithAuth(token).get(
    apiEndpoint,
    {
      headers: options?.headers,
    }
  );
  return response;
};

/**
 * @description Get friends of the current logged in user
 * @param token Access token
 * @param limit Limit to fetch friends
 * @param offset Offset to fetch friends
 * @param options Axios Request options
 * @returns
 */
export const getFriends = async (
  token: string,
  limit = 5,
  offset = 0,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${USER_ROUTE_V1}${USER_GET_FRIENDS_V1}?limit=${limit}&offset=${offset}`;
  const response: AxiosResponse<GetFriendsResponse> = await getAxiosServerWithAuth(token).get(apiEndpoint, {
    headers: options?.headers,
  });
  return response;
};
