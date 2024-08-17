import type { AppContext } from "@/context";
import type { NextFunction, Request, Response } from "express";

import chrona from "chrona";
import compression from "compression";
import cors from "cors";
import express, { json } from "express";
import helmet from "helmet";

import { BadRequestError } from "@votewise/lib/errors";

import { parseIp } from "@/lib/ip";

export class AppMiddleware {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public register() {
    const extractIp = extractIpMiddlewareFactory();
    return [
      chrona(":date :incoming :method :url :status :response-time :remote-address", (l) => this.ctx.logger.info(l)),
      compression(),
      cors(this.ctx.config.cors),
      helmet(),
      express.urlencoded({ extended: true }),
      json({ limit: this.ctx.config.blobUploadLimit }),
      extractIp
    ];
  }
}

function extractIpMiddlewareFactory() {
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
