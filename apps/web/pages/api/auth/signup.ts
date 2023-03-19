import type { AxiosResponse } from "axios";
import cookie from "cookie";

import type { NextApiRequest, NextApiResponse } from "next";

import { AUTH_ROUTE_V1, REGISTER_USER_V1 } from "@votewise/lib";
import { logger } from "@votewise/lib/logger";
import type { RegisterUserPayload } from "@votewise/types";

import { axiosServerInstance } from "server/lib/axios";
import { getProxyHeaders } from "server/lib/getProxyHeaders";

const apiEndpoint = `${AUTH_ROUTE_V1}${REGISTER_USER_V1}`;
const { COOKIE_ACCESS_TOKEN_KEY, COOKIE_REFRESH_TOKEN_KEY, COOKIE_IS_ONBOARDED_KEY } = process.env;

type BodyPayload = RegisterUserPayload & {
  rememberMe: boolean;
};

type Response = AxiosResponse<{
  message: string;
  error: null;
  data: { accessToken: string; refreshToken: string };
  success: boolean;
}>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { body } = req;
  const { rememberMe, ...payload } = body as unknown as BodyPayload;
  const headers = getProxyHeaders(req);

  try {
    const response = await axiosServerInstance.post<RegisterUserPayload, Response>(apiEndpoint, payload, {
      headers,
    });
    const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
    res.setHeader("Set-Cookie", [
      cookie.serialize(COOKIE_ACCESS_TOKEN_KEY as string, response.data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge,
        path: "/",
      }),
      cookie.serialize(COOKIE_REFRESH_TOKEN_KEY as string, response.data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge,
        path: "/",
      }),
      cookie.serialize(COOKIE_IS_ONBOARDED_KEY as string, "false", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      }),
    ]);

    const { headers: responseHeaders, data, status } = response;
    Object.entries(responseHeaders).forEach((keyArr) => {
      const [key, value] = keyArr;
      res.setHeader(key, value);
    });

    return res.status(status).json(data);
  } catch (err: any) {
    logger(err.response.data, "error");
    const status = err.response.status || 500;
    const data = err.response.data || { message: "Something went wrong" };
    return res.status(status).json(data);
  }
}
