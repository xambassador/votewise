import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const onboardStatus = await this.ctx.services.session.getOnboardStatus(locals.payload.sub);
    if (onboardStatus) {
      const result = { is_onboarded: onboardStatus === "ONBOARDED" ? true : false };
      return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
    }

    const _user = await this.ctx.repositories.user.findById(locals.payload.sub);
    this.ctx.assert.resourceNotFound(!_user, "User not found", ERROR_CODES.AUTH.USER_NOT_FOUND);

    const user = _user!;
    const result = { is_onboarded: user.is_onboarded };
    await this.ctx.services.session.saveOnboardStatus(
      locals.payload.sub,
      user.is_onboarded ? "ONBOARDED" : "NOT_ONBOARDED"
    );
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetUserOnboardStatusResponse = ExtractControllerResponse<Controller>;
