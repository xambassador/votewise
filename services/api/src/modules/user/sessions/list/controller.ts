import type { AppContext } from "@/context";
import type { Locals } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

type ControllerOptions = {
  sessionManager: AppContext["sessionManager"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = res.locals as Locals;
    const { user_id } = locals.session.accessToken;
    const sessions = await this.ctx.sessionManager.getSessions(user_id);
    return res.status(StatusCodes.OK).json({ sessions });
  }
}
