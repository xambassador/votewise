import type { AxiosResponse } from "axios";

import type { OnboardingPayload, OnboardingResponse } from "@votewise/types";

import { axiosInstance } from "lib/axios";

/**
 * Onboard a user
 */
export const onboardUser = async (data: OnboardingPayload) => {
  const response: AxiosResponse<OnboardingResponse> = await axiosInstance.post("/onboarding", data);
  return response.data;
};
