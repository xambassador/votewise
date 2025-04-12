import type { DevelopmentRouter } from "./dev-router";

import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { moduleRouterFactory } from "@/core/router";

type AppRouterOptions = {
  basePath?: string;
  devRouter: DevelopmentRouter;
};

export class AppRouter {
  private readonly basePath: string;
  private readonly devRouter: DevelopmentRouter;

  constructor(opts: AppRouterOptions) {
    this.basePath = opts.basePath ?? "/api";
    this.devRouter = opts.devRouter;
  }

  public register() {
    const router = Router();
    router.use(moduleRouterFactory(this.basePath));
    this.devRouter.register(router).mount();
    router.use("*", (req, res) => {
      const route = req.originalUrl;
      const method = req.method;
      const message = `${method} ${route} does not exist`;
      return res.status(StatusCodes.NOT_FOUND).json({ error: { message } });
    });
    return router;
  }
}
