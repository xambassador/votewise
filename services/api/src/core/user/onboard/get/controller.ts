import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const _user = await this.ctx.userRepository.findById(locals.payload.sub);
    this.ctx.assert.resourceNotFound(!_user, "User does not exist");
    const user = _user!;
    return res.status(StatusCodes.OK).json({ is_onboarded: user.is_onboarded });
  }
}
