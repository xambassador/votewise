import cookie from "cookie";
import httpStatusCodes from "http-status-codes";

import type { NextApiRequest, NextApiResponse } from "next";

import { ONBOARDING_ROUTE_V1, ONBOARDING_UPDATE_V1 } from "@votewise/lib";
import { logger } from "@votewise/lib/logger";

import { getAxiosServerWithAuth } from "server/lib/axios";
import { getProxyHeaders } from "server/lib/getProxyHeaders";
import { getServerSession } from "server/lib/getServerSession";

const { COOKIE_IS_ONBOARDED_KEY } = process.env;

const apiEndpoint = `${ONBOARDING_ROUTE_V1}${ONBOARDING_UPDATE_V1}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = getProxyHeaders(req);

  try {
    const session = await getServerSession({ req, res });
    if (!session) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
        error: {
          message: "Unauthorized",
        },
        success: false,
        data: null,
      });
    }
    const { userId, accessToken } = session;
    const response = await getAxiosServerWithAuth(accessToken).patch(
      apiEndpoint.replace(":userId", `${userId}`),
      req.body,
      {
        headers,
      }
    );
    const { headers: responseHeaders, data, status } = response;
    Object.entries(responseHeaders).forEach((keyArr) => {
      const [key, value] = keyArr;
      res.setHeader(key, value);
    });
    res.setHeader("Set-Cookie", [
      cookie.serialize(COOKIE_IS_ONBOARDED_KEY as string, "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      }),
    ]);
    return res.status(status).json(data);
  } catch (err: any) {
    logger(err.response, "error");
    const status = err.response.status || 500;
    const data = err.response.data || { message: "Something went wrong" };
    return res.status(status).json(data);
  }
}
