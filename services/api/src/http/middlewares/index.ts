import chrona from "chrona";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { json, urlencoded } from "express";
import helmet from "helmet";

import { AppContext } from "@/context";

import { extractIpMiddlewareFactory } from "./ip";

export class AppMiddleware {
  constructor() {}

  public register() {
    const extractIp = extractIpMiddlewareFactory();
    const ctx = AppContext.getInjectionTokens(["config", "logger", "environment"]);
    return [
      chrona(":date :incoming :method :url :status :response-time :remote-address", (l) => ctx.logger.info(l)),
      cookieParser(ctx.environment.API_COOKIE_SECRET),
      compression(),
      cors(ctx.config.cors),
      helmet(),
      urlencoded({ extended: true }),
      json({ limit: ctx.config.blobUploadLimit }),
      extractIp
    ];
  }
}
