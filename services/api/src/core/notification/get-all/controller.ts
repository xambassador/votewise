import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  notificationRepository: AppContext["repositories"]["notification"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(ctx: ControllerOptions) {
    this.ctx = ctx;
  }

  public async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;
    const notifications = await this.ctx.notificationRepository.findByUserId(currentUserId);
    const result = { notifications };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllNotificationsResponse = ExtractControllerResponse<Controller>;
