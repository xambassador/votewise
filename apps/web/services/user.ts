import type { AxiosResponse } from "axios";

import type {
  CreatePostPayload,
  CreatePostResponse,
  DeletePostResponse,
  GetMyPostsResponse,
  MyDetailsResponse,
  OnboardingPayload,
  OnboardingResponse,
  UpdatePostPayload,
  UpdatePostResponse,
  UsernameAvailableResponse,
} from "@votewise/types";

import { axioInstance } from "lib/axios";

/**
 *
 * @description Check if a username is available
 * @param username Username to check availability for
 * @returns
 */
export const checkUsernameAvailability = async (username: string) => {
  const response: AxiosResponse<UsernameAvailableResponse> = await axioInstance.get(
    `/usernameAvailable?username=${username}`
  );
  return response.data;
};

/**
 *
 * @description Onboard a user
 */
export const onboardUser = async (data: OnboardingPayload) => {
  const response: AxiosResponse<OnboardingResponse> = await axioInstance.post("/onboarding", data);
  return response.data;
};

/**
 * @description Get user information
 */
export const getMyDetails = async () => {
  const response: AxiosResponse<MyDetailsResponse> = await axioInstance.get("/user/me");
  return response.data;
};

/**
 * @description Create a new post
 */
export const createPost = async (payload: CreatePostPayload) => {
  const response: AxiosResponse<CreatePostResponse> = await axioInstance.post("/user/post", payload);
  return response.data;
};

type PostStatus = "open" | "closed" | "archived" | "inprogress";
type OrderBy = "asc" | "desc";
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
  const response: AxiosResponse<GetMyPostsResponse> = await axioInstance.get(apiEndpoint);
  return response.data;
};

/**
 * @description Update a post
 * @param postId Post ID to update
 * @param payload Payload to update the post with
 * @returns
 */
export const updatePost = async (postId: number, payload: UpdatePostPayload) => {
  const response: AxiosResponse<UpdatePostResponse> = await axioInstance.patch(
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
  const response: AxiosResponse<DeletePostResponse> = await axioInstance.delete(apiEndpoint);
  return response.data;
};
