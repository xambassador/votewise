import type { NextApiRequest } from "next";

/**
 * Get headers with X-Forwarded-For, Content-Type, Accept, X-User-Agent and cookie
 * @param req NextApiRequest
 */
export function getProxyHeaders(req: NextApiRequest): Record<string, string> {
  return {
    "X-Forwarded-For": (req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.socket.remoteAddress) as string,
    "Content-Type": req.headers["content-type"] as string,
    Accept: req.headers.accept as string,
    "X-User-Agent": req.headers["user-agent"] as string,
    cookie: req.headers.cookie as string,
  };
}
