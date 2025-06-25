import chrona from "chrona";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { json, urlencoded } from "express";
import helmet from "helmet";

import { AppContext } from "@/context";
import { ChaosMonkey } from "@/lib/chaos-monkey";

import { extractIpMiddlewareFactory } from "./ip";

export class AppMiddleware {
  constructor() {}

  public register() {
    const extractIp = extractIpMiddlewareFactory();
    const ctx = AppContext.getInjectionTokens(["config", "logger", "environment"]);
    const shouldEnableChaosMonkey = ctx.environment.ENABLE_CHAOS_MONKEY;
    const isProduction = ctx.environment.NODE_ENV === "production";

    if (isProduction && shouldEnableChaosMonkey) {
      ctx.logger.warn("Chaos Monkey is enabled in production! This may cause unexpected behavior.");
    }

    const chaosMonkey = new ChaosMonkey({
      logChaos: (message) => ctx.logger.info(message),
      enabled: ctx.environment.ENABLE_CHAOS_MONKEY
    });

    return [
      chrona(":date :incoming :method :url :status :response-time :remote-address", (l) => ctx.logger.info(l)),
      cookieParser(ctx.environment.API_COOKIE_SECRET),
      compression(),
      cors(ctx.config.cors),
      helmet(),
      urlencoded({ extended: true }),
      json({ limit: ctx.config.blobUploadLimit }),
      extractIp,
      ...(shouldEnableChaosMonkey ? [chaosMonkey.register()] : [])
    ];
  }
}
