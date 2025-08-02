import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  sessionManager: AppContext["services"]["session"];
  assert: AppContext["assert"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(_: Request, res: Response) {
    const { payload } = getAuthenticateLocals(res);
    await this.ctx.sessionManager.delete(payload.session_id);
    return res.status(StatusCodes.NO_CONTENT).send();
  }
}
