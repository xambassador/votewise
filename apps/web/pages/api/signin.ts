import axios from "axios";
import type { AxiosResponse } from "axios";
import cookie from "cookie";
import { getProxyHeaders } from "lib";

import type { NextApiRequest, NextApiResponse } from "next";

import { AUTH_ROUTE_V1, LOGIN_USER_V1 } from "@votewise/lib";
import type { LoginPayload } from "@votewise/types";

const baseUrl = `${process.env.BACKEND_URL}`;
const apiEndpoint = `${baseUrl}${AUTH_ROUTE_V1}${LOGIN_USER_V1}`;

type BodyPayload = LoginPayload;

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
    const response = await axios.post<LoginPayload, Response>(apiEndpoint, payload, {
      headers,
    });
    const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
    res.setHeader("Set-Cookie", [
      cookie.serialize("votewise-utoken", response.data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge,
        path: "/",
      }),
      cookie.serialize("votewise-rtoken", response.data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge,
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
    const status = err.response.status || 500;
    const data = err.response.data || { message: "Something went wrong" };
    return res.status(status).json(data);
  }
}
