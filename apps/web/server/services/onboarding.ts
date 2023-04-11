import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAxiosServerWithAuth } from "server/lib/axios";

import { ONBOARDING_ROUTE_V1, ONBOARDING_STATUS_V1, ONBOARDING_UPDATE_V1 } from "@votewise/lib";
import type { OnboardingPayload, OnboardingResponse } from "@votewise/types";

/**
 *
 * @description Get onboarding status of user
 * @param token JWT token
 * @returns
 */
export const getOnboardingStatus = async (token: string) => {
  const apiEndpoint = `${ONBOARDING_ROUTE_V1}${ONBOARDING_STATUS_V1}`;
  const response: AxiosResponse<{
    success: boolean;
    message: string;
    error: null;
    data: { onboarded: boolean };
  }> = await getAxiosServerWithAuth(token).get(apiEndpoint);
  return response.data.data.onboarded;
};

/**
 *
 * @description Update user onboarding details.
 * @param options
 * @returns
 *
 */
export const onboardUser = async (options: {
  token: string;
  payload: OnboardingPayload;
  headers: AxiosRequestConfig["headers"];
}) => {
  const apiEndpoint = `${ONBOARDING_ROUTE_V1}${ONBOARDING_UPDATE_V1}`;
  const response: AxiosResponse<OnboardingResponse> = await getAxiosServerWithAuth(options.token).patch(
    apiEndpoint,
    options.payload,
    {
      headers: options.headers,
    }
  );
  return response;
};
