import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  onboardService: AppContext["onboardService"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const onboardData = await this.ctx.onboardService.getUserOnboardData(locals.payload.sub);
    return res.status(StatusCodes.OK).json(onboardData) as Response<typeof onboardData>;
  }
}

export type GetUserOnboardSessionResponse = ExtractControllerResponse<Controller>;
