import type { AxiosResponse } from "axios";
import { axiosServerInstance } from "server/lib/axios";

import { AUTH_ROUTE_V1, REVOKE_ACCESS_TOKEN_V1 } from "@votewise/lib";

type Response = {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  error: null;
  success: true;
};

export const revokeAccessToken = async (refreshToken: string) => {
  const apiEndpoint = `${AUTH_ROUTE_V1}${REVOKE_ACCESS_TOKEN_V1}`;
  const response: AxiosResponse<Response> = await axiosServerInstance.patch(apiEndpoint, { refreshToken });
  return response.data;
};
