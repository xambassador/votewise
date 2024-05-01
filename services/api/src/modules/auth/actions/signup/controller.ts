import type Domain from "@/modules/auth/actions/signup/domain";
import type { Request, Response } from "express";

import { BaseController } from "@/class/controller.base";

interface InjectableDependencies {
  domain: Domain;
}

class Controller extends BaseController {
  private readonly domain: InjectableDependencies["domain"];

  constructor(private readonly dependencies: InjectableDependencies) {
    super();

    this.domain = dependencies.domain;
  }

  async handle<P, ResBody, ReqBody, ReqQuery, Locals extends Record<string, unknown>>(
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response
  ) {
    await this.domain.execute();
    res.send("Signup");
  }
}

export default Controller;
