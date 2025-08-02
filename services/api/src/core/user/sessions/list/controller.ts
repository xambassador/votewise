import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

type ControllerOptions = {
  sessionManager: AppContext["services"]["session"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(_: Request, res: Response) {
    this.ctx.sessionManager.getSessionKey("");
    return res.status(StatusCodes.OK).json({ sessions: [] });
  }
}
