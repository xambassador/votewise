import type { NextFunction, Request, Response } from "express";

import { BadRequestError } from "@votewise/lib/errors";

import { parseIp } from "@/lib/ip";

export function extractIpMiddlewareFactory() {
  return function extractIp(req: Request, res: Response, next: NextFunction) {
    const ipAddress = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
    if (!ipAddress) {
      return next(new BadRequestError("Looks like you are behind a proxy or VPN"));
    }
    const ip = parseIp(ipAddress!);
    res.locals.meta = { ip };
    return next();
  };
}
