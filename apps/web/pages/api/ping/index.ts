import router from "@/routes/ping";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await router.handleRequest(req, res);
  return response;
}
