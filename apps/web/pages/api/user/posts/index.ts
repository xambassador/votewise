import httpStatusCodes from "http-status-codes";

import type { NextApiRequest, NextApiResponse } from "next";

import { getError } from "server/lib/getError";
import { getProxyHeaders } from "server/lib/getProxyHeaders";
import { getServerSession } from "server/lib/getServerSession";
import { UNAUTHORIZED_RESPONSE } from "server/lib/response";

import { getMyPosts } from "server/services/user";

const { UNAUTHORIZED } = httpStatusCodes;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { limit, offset, status: postStatus } = req.query;
  const headers = getProxyHeaders(req);

  try {
    const session = await getServerSession({ req, res });
    if (!session) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    const response = await getMyPosts(
      session.accessToken,
      Number(limit),
      Number(offset),
      postStatus as "open" | "closed" | "archived" | "inprogress",
      {
        headers,
      }
    );

    const { headers: responseHeaders, data, status } = response;
    Object.entries(responseHeaders).forEach((keyArr) => {
      const [key, value] = keyArr;
      res.setHeader(key, value);
    });

    return res.status(status).json(data);
  } catch (err: any) {
    const { status, data } = getError(err);
    return res.status(status).json(data);
  }
}
