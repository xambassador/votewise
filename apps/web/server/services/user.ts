import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAxiosServerWithAuth } from "server/lib/axios";

import {
  GET_ME_V1,
  USER_CREATE_POST_V1,
  USER_GET_POSTS_V1,
  USER_ROUTE_V1,
  USER_UPDATE_POST_V1,
} from "@votewise/lib";
import type {
  CreatePostPayload,
  CreatePostResponse,
  GetMyPostsResponse,
  MyDetailsResponse,
  UpdatePostPayload,
  UpdatePostResponse,
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
  // TODO: Need to add status for filtering
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
  postId: string,
  payload: UpdatePostPayload,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${USER_ROUTE_V1}${USER_UPDATE_POST_V1}`.replace(":postId", postId);
  const response: AxiosResponse<UpdatePostResponse> = await getAxiosServerWithAuth(token).patch(
    apiEndpoint,
    payload,
    {
      headers: options?.headers,
    }
  );
  return response;
};
