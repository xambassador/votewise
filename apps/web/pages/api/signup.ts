import axios from "axios";
import type { AxiosResponse } from "axios";
import cookie from "cookie";

import type { NextApiRequest, NextApiResponse } from "next";

import { AUTH_ROUTE_V1, REGISTER_USER_V1 } from "@votewise/lib";
import type { RegisterUserPayload } from "@votewise/types";

const baseUrl = `${process.env.BACKEND_URL}`;
const apiEndpoint = `${baseUrl}${AUTH_ROUTE_V1}${REGISTER_USER_V1}`;

type BodyPayload = RegisterUserPayload & {
  rememberMe: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { headers, body } = req;
  const { rememberMe, ...payload } = body as unknown as BodyPayload;

  try {
    const response = await axios.post<
      RegisterUserPayload,
      AxiosResponse<{
        message: string;
        error: null;
        data: { accessToken: string; resfreshToken: string };
        success: boolean;
      }>
    >(apiEndpoint, payload, {
      headers: {
        ...headers,
        "X-Forwarded-For":
          req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket.remoteAddress,
      },
    });
    let maxAge = 0;
    if (rememberMe) {
      maxAge = 60 * 60 * 24 * 7; // 7 days
    } else {
      maxAge = 60 * 60 * 24; // 1 day
    }
    res.setHeader("Set-Cookie", [
      cookie.serialize("votewise-utoken", response.data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge,
        path: "/",
      }),
      cookie.serialize("votewise-rtoken", response.data.data.resfreshToken, {
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
