import httpStatusCodes from "http-status-codes";

import type { NextApiRequest, NextApiResponse } from "next";

import type { PostStatus } from "@votewise/types";

import { getError } from "server/lib/getError";
import { getProxyHeaders } from "server/lib/getProxyHeaders";
import { getProxyResponseHeaders } from "server/lib/getProxyResponseHeaders";
import { getServerSession } from "server/lib/getServerSession";
import { UNAUTHORIZED_RESPONSE } from "server/lib/response";

import { getMyComments } from "server/services/user";

const { UNAUTHORIZED } = httpStatusCodes;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = getProxyHeaders(req);
  const { limit, offset, status: postStatus, orderBy } = req.query;

  try {
    const session = await getServerSession({ req, res });
    if (!session) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    const response = await getMyComments(
      session.accessToken,
      postStatus as PostStatus,
      orderBy as "asc" | "desc",
      Number(limit),
      Number(offset),
      {
        headers,
      }
    );

    const { headers: responseHeaders, data, status } = response;
    getProxyResponseHeaders(res, responseHeaders);

    return res.status(status).json(data);
  } catch (err: any) {
    const { status, data } = getError(err);
    return res.status(status).json(data);
  }
}
