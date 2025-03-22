import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { Minute } from "@votewise/times";

type ControllerOptions = {
  cache: AppContext["cache"];
  assert: AppContext["assert"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const email = req.params.email!;
    this.ctx.assert.unprocessableEntity(!email, "Email is missing");
    const key = `email:${email}:verification`;
    const session = await this.ctx.cache.get(key);
    this.ctx.assert.resourceNotFound(!session, "Verification session not found");
    const data = JSON.parse(session!) as { userId: string; ip: string; email: string };
    const ttl = await this.ctx.cache.getRemainingTime(key);
    return res.status(StatusCodes.OK).json({ user_id: data.userId, ttl, total: 5 * Minute, email: data.email });
  }
}
