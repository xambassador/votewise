import type { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import type { NextApiResponse } from "next";

export function getProxyResponseHeaders(
  res: NextApiResponse,
  headers: AxiosResponseHeaders | Partial<RawAxiosResponseHeaders>
) {
  Object.entries(headers).forEach((keyArr) => {
    const [key, value] = keyArr;
    res.setHeader(key, value);
  });
}
