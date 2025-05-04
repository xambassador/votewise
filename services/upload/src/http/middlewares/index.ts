import chrona from "chrona";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { json, static as static_, urlencoded } from "express";
import helmet from "helmet";

import { AppContext } from "@/context";

export class AppMiddleware {
  constructor() {}

  public register() {
    const ctx = AppContext.instance;
    return [
      chrona(":date :incoming :method :url :status :response-time :remote-address", (l) => ctx.logger.info(l)),
      cookieParser(ctx.environment.API_COOKIE_SECRET),
      compression(),
      cors(ctx.config.cors),
      helmet(),
      urlencoded({ extended: true }),
      json({ limit: ctx.config.blobUploadLimit }),
      static_("public")
    ];
  }
}
