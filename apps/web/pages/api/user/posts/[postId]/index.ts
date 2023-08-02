import httpStatusCodes from "http-status-codes";

import type { NextApiRequest, NextApiResponse } from "next";

import { getError } from "server/lib/getError";
import { getProxyHeaders } from "server/lib/getProxyHeaders";
import { getProxyResponseHeaders } from "server/lib/getProxyResponseHeaders";
import { getServerSession } from "server/lib/getServerSession";
import { UNAUTHORIZED_RESPONSE } from "server/lib/response";

import { deletePost, updatePost } from "server/services/user";

const { UNAUTHORIZED } = httpStatusCodes;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postId } = req.query;
  const payload = req.body;
  const { method } = req;
  const headers = getProxyHeaders(req);

  try {
    const session = await getServerSession({ req, res });
    if (!session) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    if (method === "PATCH") {
      const response = await updatePost(session.accessToken, Number(postId), payload, {
        headers,
      });

      const { headers: responseHeaders, data, status } = response;
      getProxyResponseHeaders(res, responseHeaders);
      return res.status(status).json(data);
    }

    if (method === "DELETE") {
      const response = await deletePost(session.accessToken, Number(postId), {
        headers,
      });
      const { headers: responseHeaders, data, status } = response;
      getProxyResponseHeaders(res, responseHeaders);
      return res.status(status).json(data);
    }

    return res.status(httpStatusCodes.NOT_FOUND).json({
      data: null,
      error: {
        message: `The ${method} is not exists on this route`,
      },
      success: false,
      message: `The ${method} is not exists on this route`,
    });
  } catch (err) {
    const { status, data } = getError(err);
    return res.status(status).json(data);
  }
}
