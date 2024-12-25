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
    const verificationCode = req.params.verification_code!;
    this.ctx.assert.unprocessableEntity(!verificationCode, "Verification code is required");
    const session = await this.ctx.cache.get(verificationCode);
    this.ctx.assert.resourceNotFound(!session, "Verification session not found");
    const data = JSON.parse(session!) as { userId: string; ip: string; email: string };
    const ttl = await this.ctx.cache.getRemainingTime(verificationCode);
    return res.status(StatusCodes.OK).json({ user_id: data.userId, ttl, total: 5 * Minute, email: data.email });
  }
}
