import type { NextApiRequest, NextApiResponse } from "next";

import { CHECK_USERNAME_AVAILABILITY_V1, USER_ROUTE_V1 } from "@votewise/lib";

import { axiosServerInstance } from "server/lib/axios";
import { getProxyHeaders } from "server/lib/getProxyHeaders";

const apiEndpoint = `${USER_ROUTE_V1}${CHECK_USERNAME_AVAILABILITY_V1}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = getProxyHeaders(req);

  try {
    const response = await axiosServerInstance.get(`${apiEndpoint}?username=${req.query.username}`, {
      headers,
    });

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
