import type { AxiosResponse } from "axios";
import { getAxiosServerWithAuth } from "server/lib/axios";

import { ONBOARDING_ROUTE_V1, ONBOARDING_STATUS_V1 } from "@votewise/lib";

const apiEndpoint = `${ONBOARDING_ROUTE_V1}${ONBOARDING_STATUS_V1}`;

export const getOnboardingStatus = async (userId: number, token: string) => {
  const response: AxiosResponse<{
    success: boolean;
    message: string;
    error: null;
    data: { onboarded: boolean };
  }> = await getAxiosServerWithAuth(token).get(`${apiEndpoint}`.replace(":userId", userId.toString()));
  return response.data.data.onboarded;
};
