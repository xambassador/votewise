import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { revokeAccessToken } from "server/services/revokeToken";

import { logger } from "@votewise/lib/logger";

import { clearCookies } from "./clearCookies";
import { decodeJwt } from "./decodeJwt";
import { getCookie } from "./getCookie";
import { setAuthCookies } from "./setAuthCookies";

type Options = {
  req: NextApiRequest | GetServerSidePropsContext["req"];
  res: NextApiResponse | GetServerSidePropsContext["res"];
};

/**
 * @description Decode access token
 * @param token Access token
 * @returns
 */
const decodeToken = (token: string) => {
  try {
    const decoded = decodeJwt(token) as { userId: number };
    return {
      userId: decoded.userId,
      accessToken: token,
      error: null,
    };
  } catch (err: any) {
    return {
      userId: null,
      accessToken: null,
      error: err,
    };
  }
};

/**
 * @description Check if user is authenticated or not. It will also refresh the token if it is expired
 * @param options
 * @returns User id and access token if user is authenticated. Otherwise, null is user is not authenticated or token is expired and cannot be refreshed
 * It will also set the cookies if token is refreshed successfully. Otherwise, it will clear the cookies
 */
export const getServerSession = async (
  options: Options
): Promise<{
  userId: number;
  accessToken: string;
} | null> => {
  const { req, res } = options;
  const token = getCookie(req, "ACCESS_TOKEN");

  if (!token) {
    return null;
  }

  const decoded = decodeToken(token);

  if (!decoded.error) {
    return {
      userId: decoded.userId as number,
      accessToken: token,
    };
  }

  if (decoded.error.message === "jwt expired") {
    const refreshToken = getCookie(req, "REFRESH_TOKEN");
    if (!refreshToken) {
      clearCookies(res);
      return null;
    }

    try {
      logger("====> Trying to refresh token");
      const response = await revokeAccessToken(refreshToken);
      setAuthCookies(res, {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });

      return {
        userId: decodeToken(response.data.accessToken).userId as number,
        accessToken: response.data.accessToken,
      };
    } catch (err: any) {
      logger(`====> Error refreshing token   ${err?.response}`, "error");
      clearCookies(res);
      return null;
    }
  }

  clearCookies(res);
  return null;
};
