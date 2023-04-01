import type { AxiosResponse } from "axios";
import type { OrderBy, PostStatus } from "types/post";

import type {
  CreatePostPayload,
  CreatePostResponse,
  DeletePostResponse,
  GetFriendsResponse,
  GetMyCommentsResponse,
  GetMyPostsResponse,
  MyDetailsResponse,
  OnboardingPayload,
  OnboardingResponse,
  UpdatePostPayload,
  UpdatePostResponse,
  UpdatePostStatusResponse,
  UsernameAvailableResponse,
} from "@votewise/types";

import { axiosInstance } from "lib/axios";

/**
 *
 * @description Check if a username is available
 * @param username Username to check availability for
 * @returns
 */
export const checkUsernameAvailability = async (username: string) => {
  const response: AxiosResponse<UsernameAvailableResponse> = await axiosInstance.get(
    `/usernameAvailable?username=${username}`
  );
  return response.data;
};

/**
 *
 * @description Onboard a user
 */
export const onboardUser = async (data: OnboardingPayload) => {
  const response: AxiosResponse<OnboardingResponse> = await axiosInstance.post("/onboarding", data);
  return response.data;
};

/**
 * @description Get user information
 */
export const getMyDetails = async () => {
  const response: AxiosResponse<MyDetailsResponse> = await axiosInstance.get("/user/me");
  return response.data;
};

/**
 * @description Create a new post
 */
export const createPost = async (payload: CreatePostPayload) => {
  const response: AxiosResponse<CreatePostResponse> = await axiosInstance.post("/user/post", payload);
  return response.data;
};

/**
 * @description Get all posts created by the curent logged in user
 * @param limit Limit of posts to fetch. Default is 5
 * @param offset Offset of posts to fetch. Default is 0
 * @returns
 */
export const getMyPosts = async (
  limit = 5,
  offset = 0,
  status: PostStatus = "open",
  orderBy: OrderBy = "desc"
) => {
  const apiEndpoint = `/user/posts?limit=${limit}&offset=${offset}&status=${status}&orderBy=${orderBy}`;
  const response: AxiosResponse<GetMyPostsResponse> = await axiosInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Update a post
 * @param postId Post ID to update
 * @param payload Payload to update the post with
 * @returns
 */
export const updatePost = async (postId: number, payload: UpdatePostPayload) => {
  const response: AxiosResponse<UpdatePostResponse> = await axiosInstance.patch(
    `/user/posts/${postId}`,
    payload
  );
  return response.data;
};

/**
 * @description Delete post.
 * @param postId Post id
 */
export const deletePost = async (postId: number) => {
  const apiEndpoint = `/user/posts/${postId}`;
  const response: AxiosResponse<DeletePostResponse> = await axiosInstance.delete(apiEndpoint);
  return response.data;
};

/**
 * @description Change post status
 * @param postId Post id
 * @param status Status to change to
 */
export const updatePostStatus = async (postId: number, status: PostStatus) => {
  const apiEndpoint = `/user/posts/${postId}/status`;
  const response: AxiosResponse<UpdatePostStatusResponse> = await axiosInstance.patch(apiEndpoint, {
    status: status.toUpperCase(),
  });
  return response.data;
};

/**
 * @description Get all comments created by the current logged in user
 * @param limit Limit to fetch comments. Default is 5
 * @param offset Offset to fetch comments. Default is 0
 * @returns
 */
export const getMyComments = async (status: PostStatus, orderBy: OrderBy, limit = 5, offset = 0) => {
  const apiEndpoint = `/user/comments?limit=${limit}&offset=${offset}&status=${status.toUpperCase()}&orderBy=${orderBy}`;
  const response: AxiosResponse<GetMyCommentsResponse> = await axiosInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Get all friends of the current logged in user
 * @param limit Limit to fetch friends. Default is 5
 * @param offset Offset to fetch friends. Default is 0
 * @returns
 */
export const getMyFriends = async (limit = 5, offset = 0) => {
  const apiEndpoint = `/user/friends?limit=${limit}&offset=${offset}`;
  const response: AxiosResponse<GetFriendsResponse> = await axiosInstance.get(apiEndpoint);
  return response.data;
};
