import type { AxiosResponse } from "axios";
import { axiosServerInstance } from "server/lib/axios";

import { AUTH_ROUTE_V1, REVOKE_ACCESS_TOKEN_V1 } from "@votewise/lib";
import type { RevokeAccessTokenResponse } from "@votewise/types";

/**
 *
 * @description Revoke access token
 * @param refreshToken Refresh token
 * @returns
 */
export const revokeAccessToken = async (refreshToken: string) => {
  const apiEndpoint = `${AUTH_ROUTE_V1}${REVOKE_ACCESS_TOKEN_V1}`;
  const response: AxiosResponse<RevokeAccessTokenResponse> = await axiosServerInstance.patch(apiEndpoint, {
    refreshToken,
  });
  return response.data;
};
