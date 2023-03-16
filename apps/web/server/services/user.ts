import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAxiosServerWithAuth } from "server/lib/axios";

import { GET_ME_V1, USER_ROUTE_V1 } from "@votewise/lib";
import type { MyDetailsResponse } from "@votewise/types";

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
