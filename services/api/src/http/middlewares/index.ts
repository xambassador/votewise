import type { AppContext } from "@/context";

import chrona from "chrona";
import compression from "compression";
import cors from "cors";
import express, { json } from "express";
import helmet from "helmet";

import { extractIpMiddlewareFactory } from "./ip";

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
