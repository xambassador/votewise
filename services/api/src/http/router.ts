import type { AppContext } from "./context";

import { Router } from "express";

import { createAuthRouter } from "@/modules";

export class ServerRouter {
  private readonly ctx: AppContext;

  constructor(ctx: AppContext) {
    this.ctx = ctx;
  }

  public registerAuthRouter(): Router {
    const router = Router();
    router.use(createAuthRouter(this.ctx));
    return router;
  }
}
