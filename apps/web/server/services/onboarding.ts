import axios from "axios";
import type { AxiosResponse } from "axios";

import { ONBOARDING_ROUTE_V1, ONBOARDING_STATUS_V1 } from "@votewise/lib";

const baseUrl = `${process.env.BACKEND_URL}`;
const apiEndpoint = `${baseUrl}${ONBOARDING_ROUTE_V1}${ONBOARDING_STATUS_V1}`;

export const getOnboardingStatus = async (userId: number, token: string) => {
  try {
    const { data } = await axios.get<
      AxiosResponse<{ success: boolean; message: string; error: null; data: { onboarded: boolean } }>
    >(`${apiEndpoint}`.replace(":userId", userId.toString()), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data: data.data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
};
