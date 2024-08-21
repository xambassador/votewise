import type { AppContext } from "@/context";
import type { Locals } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

type ControllerOptions = {
  sessionManager: AppContext["sessionManager"];
  assert: AppContext["assert"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = res.locals as Locals;
    const { user_id, session_id } = locals.session.accessToken;
    const session = await this.ctx.sessionManager.getSession(user_id, session_id);
    this.ctx.assert.badRequest(!session || Object.keys(session).length === 0, "Invalid session");
    await this.ctx.sessionManager.delete(user_id, session_id);
    return res.status(StatusCodes.NO_CONTENT).send();
  }
}
