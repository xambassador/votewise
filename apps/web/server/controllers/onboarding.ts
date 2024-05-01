import type { OnboardingPayload } from "@votewise/types";
import type { NextApiRequest, NextApiResponse } from "next";

import cookie from "cookie";
import { StatusCodes } from "http-status-codes";
import { onboardUser } from "server/services/onboarding";

import { logger } from "@votewise/lib/logger";

import { getError } from "server/lib/getError";
import { getProxyHeaders } from "server/lib/getProxyHeaders";
import { getProxyResponseHeaders } from "server/lib/getProxyResponseHeaders";
import { getServerSession } from "server/lib/getServerSession";
import { UNAUTHORIZED_RESPONSE } from "server/lib/response";

const { COOKIE_IS_ONBOARDED_KEY } = process.env;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = getProxyHeaders(req);

  try {
    const session = await getServerSession({ req, res });
    if (!session) {
      return res.status(StatusCodes.UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }
    const { accessToken } = session;
    const response = await onboardUser({
      token: accessToken,
      payload: req.body as OnboardingPayload,
      headers,
    });
    const { headers: responseHeaders, data, status } = response;
    getProxyResponseHeaders(res, responseHeaders);

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
    const { status, data } = getError(err);
    return res.status(status).json(data);
  }
}
