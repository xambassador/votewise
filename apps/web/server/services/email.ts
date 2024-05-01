import type { AxiosRequestConfig } from "axios";

import { AxiosError } from "axios";

import { AUTH_ROUTE_V1, VERIFY_EMAIL_V1 } from "@votewise/lib/routes";

import { axiosServerInstance } from "../lib/axios";

export const verifyEmail = async (
  token: string,
  options?: {
    headers: AxiosRequestConfig["headers"];
  }
) => {
  const apiEndpoint = `${AUTH_ROUTE_V1}${VERIFY_EMAIL_V1}?token=${token}`;

  try {
    const response = await axiosServerInstance.patch(apiEndpoint, {}, options);
    return { data: response.data, error: null };
  } catch (err: unknown) {
    const error =
      err instanceof AxiosError
        ? err.response?.data.error.message
        : "Something went wrong while verifing your email.";
    return { data: null, error };
  }
};
