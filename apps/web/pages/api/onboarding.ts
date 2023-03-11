import axios from "axios";
import { getProxyHeaders } from "lib";

import type { NextApiRequest, NextApiResponse } from "next";

import { ONBOARDING_ROUTE_V1, ONBOARDING_UPDATE_V1 } from "@votewise/lib";

const baseUrl = `${process.env.BACKEND_URL}`;
const apiEndpoint = `${baseUrl}${ONBOARDING_ROUTE_V1}${ONBOARDING_UPDATE_V1}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = getProxyHeaders(req);
  try {
    const response = await axios.post(apiEndpoint, req.body, {
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
