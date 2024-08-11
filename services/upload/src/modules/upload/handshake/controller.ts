import type { Request, Response } from "express";
import type { Service } from "./service";

import { StatusCodes } from "http-status-codes";

import { InvalidInputError } from "@votewise/lib/errors";
import { ZHandshake } from "@votewise/schemas";

type ControllerOptions = {
  service: Service;
};

export class Controller {
  private readonly service: Service;

  constructor(opts: ControllerOptions) {
    this.service = opts.service;
  }

  private parseBody(body: unknown) {
    const validate = ZHandshake.safeParse(body);
    if (!validate.success) {
      throw new InvalidInputError(validate.error.errors[0].message);
    }
    return validate.data;
  }

  public async handle<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>, res: Response) {
    const body = this.parseBody(req.body);
    const result = await this.service.execute(body);
    return res.status(StatusCodes.OK).json(result);
  }
}
