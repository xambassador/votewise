import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  notificationRepository: AppContext["repositories"]["notification"];
};

const ZQuery = z.object({ id: z.string() });

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(ctx: ControllerOptions) {
    this.ctx = ctx;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;
    const id = req.params.id;
    const validate = ZQuery.safeParse({ id });
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const query = validate.data!;

    const _notification = await this.ctx.notificationRepository.findById(query.id);
    this.ctx.assert.resourceNotFound(!_notification, `Notification with id ${query.id} not found`);
    const notification = _notification!;

    this.ctx.assert.forbidden(
      notification.user_id !== currentUserId,
      "You are not authorized to mark this notification as read"
    );

    await this.ctx.notificationRepository.markAsRead(notification.id);
    return res.status(StatusCodes.NO_CONTENT).send();
  }
}

export type MarkNotificationReadResponse = ExtractControllerResponse<Controller>;
