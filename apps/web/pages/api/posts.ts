import httpStatusCodes from "http-status-codes";

import type { NextApiRequest, NextApiResponse } from "next";

import { getProxyHeaders } from "server/lib/getProxyHeaders";
import { getServerSession } from "server/lib/getServerSession";
import { UNAUTHORIZED_RESPONSE } from "server/lib/response";

import { getPosts } from "server/services/post";

const { UNAUTHORIZED } = httpStatusCodes;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = getProxyHeaders(req);

  try {
    const session = await getServerSession({ req, res });
    if (!session) {
      return res.status(UNAUTHORIZED).json(UNAUTHORIZED_RESPONSE);
    }

    const response = await getPosts(session.accessToken, { headers });

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
