import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAxiosServerWithAuth } from "server/lib/axios";

import { GET_ME_V1, USER_CREATE_POST_V1, USER_ROUTE_V1 } from "@votewise/lib";
import type { CreatePostPayload, CreatePostResponse, MyDetailsResponse } from "@votewise/types";

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
