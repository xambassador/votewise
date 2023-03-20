import httpStatusCodes from "http-status-codes";

import type { NextApiRequest, NextApiResponse } from "next";

import { getError } from "server/lib/getError";
import { getProxyHeaders } from "server/lib/getProxyHeaders";
import { getServerSession } from "server/lib/getServerSession";
import { UNAUTHORIZED_RESPONSE } from "server/lib/response";

import { commentOnPost } from "server/services/post";

const { UNAUTHORIZED } = httpStatusCodes;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId, text } = req.body;
  const headers = getProxyHeaders(req);

  try {
    const session = await getServerSession({ req, res });
    if (!session) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    const response = await commentOnPost(session.accessToken, Number(postId), text, {
      headers,
    });

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
