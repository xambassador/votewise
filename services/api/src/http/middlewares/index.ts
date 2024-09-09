import chrona from "chrona";
import compression from "compression";
import cors from "cors";
import { json, urlencoded } from "express";
import helmet from "helmet";

import { AppContext } from "@/context";

import { extractIpMiddlewareFactory } from "./ip";

export class AppMiddleware {
  constructor() {}

  public register() {
    const extractIp = extractIpMiddlewareFactory();
    const ctx = AppContext.getInjectionTokens(["config", "logger"]);
    return [
      chrona(":date :incoming :method :url :status :response-time :remote-address", (l) => ctx.logger.info(l)),
      compression(),
      cors(ctx.config.cors),
      helmet(),
      urlencoded({ extended: true }),
      json({ limit: ctx.config.blobUploadLimit }),
      extractIp
    ];
  }
}
