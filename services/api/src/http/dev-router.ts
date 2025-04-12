import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { previewEmails } from "@/emails/preview";

type DevelopmentRouterOptions = {
  basePath?: string;
  devMode: boolean;
};

export class DevelopmentRouter {
  private readonly basePath: string;
  private readonly devMode: boolean;
  private baseRouter: Router | undefined;
  private devRouter: Router | undefined;

  constructor(opts: DevelopmentRouterOptions) {
    this.basePath = opts.basePath ?? "/__dev";
    this.devMode = opts.devMode;
  }

  public register(baseRouter: Router) {
    this.baseRouter = baseRouter;
    const router = Router();
    router.use("/emails/preview", previewEmails);
    router.use("*", (req, res) => {
      const route = req.originalUrl;
      const method = req.method;
      const message = `${method} ${route} does not exist`;
      return res.status(StatusCodes.NOT_FOUND).json({ error: { message } });
    });
    this.devRouter = router;
    return this;
  }

  public mount() {
    if (!this.baseRouter && !this.devRouter) {
      throw new Error(`DevelopmentRouter is not registered. Make sure to call register() befor mount()`);
    }
    if (this.devMode) {
      this.baseRouter!.use(this.basePath, this.devRouter!);
    }
  }
}
