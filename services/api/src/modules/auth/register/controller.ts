import type { TRegister } from "@votewise/schemas";
import type { Request, Response } from "express";
import type { Service } from "./service";

import { InvalidInputError } from "@votewise/lib/errors";
import { ZRegister } from "@votewise/schemas";

type Dependencies = {
  service: Service;
};

export class Controller {
  private readonly service: Service;

  constructor(cfg: Dependencies) {
    this.service = cfg.service;
  }

  private parseBody(body: unknown): TRegister {
    const validate = ZRegister.safeParse(body);
    if (!validate.success) {
      const message = validate.error.errors[0].message;
      throw new InvalidInputError(message);
    }
    return validate.data;
  }

  async handle<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>, res: Response) {
    const body = this.parseBody(req.body);
    const result = await this.service.execute(body);
    return res.json(result);
  }
}
