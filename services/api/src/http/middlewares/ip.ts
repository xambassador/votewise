import type { NextFunction, Request, Response } from "express";

import { getClientIp } from "request-ip";

import { BadRequestError } from "@votewise/errors";

import { parseIp } from "@/lib/ip";

export function extractIpMiddlewareFactory() {
  return function extractIp(req: Request, res: Response, next: NextFunction) {
    const ipAddress = getClientIp(req);
    if (!ipAddress) {
      return next(new BadRequestError("Looks like you are behind a proxy or VPN"));
    }
    const ip = parseIp(ipAddress!);
    res.locals.meta = { ip };
    return next();
  };
}
