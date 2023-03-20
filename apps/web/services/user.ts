import type { AxiosResponse } from "axios";

import type {
  CreatePostPayload,
  CreatePostResponse,
  MyDetailsResponse,
  OnboardingPayload,
  OnboardingResponse,
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
