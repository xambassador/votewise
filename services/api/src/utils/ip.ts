import type { Request } from "express";

import ip from "request-ip";

/** Get ip address from incomming request */
export function getIp(req: Request) {
  return ip.getClientIp(req);
}
