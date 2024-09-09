import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { moduleRouterFactory } from "@/core/router";

type AppRouterOptions = {
  basePath?: string;
};

export class AppRouter {
  private readonly basePath: string;

  constructor(opts: AppRouterOptions) {
    this.basePath = opts.basePath ?? "/api";
  }

  public register() {
    const router = Router();
    router.use(moduleRouterFactory(this.basePath));
    router.use("*", (req, res) => {
      const route = req.originalUrl;
      const method = req.method;
      const message = `${method} ${route} does not exist`;
      return res.status(StatusCodes.NOT_FOUND).json({ error: { message } });
    });
    return router;
  }
}
