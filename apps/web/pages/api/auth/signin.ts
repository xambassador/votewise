import type { AxiosResponse } from "axios";
import cookie from "cookie";

import type { NextApiRequest, NextApiResponse } from "next";

import { AUTH_ROUTE_V1, LOGIN_USER_V1 } from "@votewise/lib";
import type { LoginPayload } from "@votewise/types";

import { axiosServerInstance } from "server/lib/axios";
import { getError } from "server/lib/getError";
import { getProxyHeaders } from "server/lib/getProxyHeaders";
import { getProxyResponseHeaders } from "server/lib/getProxyResponseHeaders";

import { getOnboardingStatus } from "server/services/onboarding";

const apiEndpoint = `${AUTH_ROUTE_V1}${LOGIN_USER_V1}`;

const { COOKIE_ACCESS_TOKEN_KEY, COOKIE_REFRESH_TOKEN_KEY, COOKIE_IS_ONBOARDED_KEY } = process.env;

type BodyPayload = {
  email: string;
  password: string;
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
  const { rememberMe, email, password } = body as unknown as BodyPayload;
  const headers = getProxyHeaders(req);
  const payload = {
    username: email,
    password,
  };

  try {
    const response = await axiosServerInstance.patch<LoginPayload, Response>(apiEndpoint, payload, {
      headers,
    });

    const onboardingStatus = await getOnboardingStatus(response.data.data.accessToken);

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
      cookie.serialize(COOKIE_IS_ONBOARDED_KEY as string, `${onboardingStatus}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      }),
    ]);

    const { headers: responseHeaders, data, status } = response;
    getProxyResponseHeaders(res, responseHeaders);

    return res.status(status).json(data);
  } catch (err) {
    const { status, data } = getError(err);
    return res.status(status).json(data);
  }
}
