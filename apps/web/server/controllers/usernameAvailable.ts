import type { NextApiRequest, NextApiResponse } from "next";

import { CHECK_USERNAME_AVAILABILITY_V1, USER_ROUTE_V1 } from "@votewise/lib/routes";

import { axiosServerInstance } from "server/lib/axios";
import { getError } from "server/lib/getError";
import { getProxyHeaders } from "server/lib/getProxyHeaders";
import { getProxyResponseHeaders } from "server/lib/getProxyResponseHeaders";

const apiEndpoint = `${USER_ROUTE_V1}${CHECK_USERNAME_AVAILABILITY_V1}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = getProxyHeaders(req);

  try {
    const response = await axiosServerInstance.get(`${apiEndpoint}?username=${req.query.username}`, {
      headers,
    });

    const { headers: responseHeaders, data, status } = response;
    getProxyResponseHeaders(res, responseHeaders);

    return res.status(status).json(data);
  } catch (err: any) {
    const { status, data } = getError(err);
    return res.status(status).json(data);
  }
}
