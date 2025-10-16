import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const onboardData = await this.ctx.services.onboard.getUserOnboardData(locals.payload.sub);
    return res.status(StatusCodes.OK).json(onboardData) as Response<typeof onboardData>;
  }
}

export type GetUserOnboardSessionResponse = ExtractControllerResponse<Controller>;
