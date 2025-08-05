import type { AppContext } from "@/context";
import type { NotificationContentSerialized } from "@/lib/notification-builder";
import type { ExtractControllerResponse } from "@/types";
import type { NotificationType } from "@votewise/prisma/client";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { notificationBuilder, ZNotification } from "@/lib/notification-builder";
import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  notificationRepository: AppContext["repositories"]["notification"];
  userRepository: AppContext["repositories"]["user"];
  groupRepository: AppContext["repositories"]["group"];
  bucketService: AppContext["services"]["bucket"];
};

type Notification = {
  id: string;
  content: NotificationContentSerialized;
  is_read: boolean;
  event_type: NotificationType;
  created_at: Date;
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(ctx: ControllerOptions) {
    this.ctx = ctx;
  }

  public async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;
    const unknownNotifications = await this.ctx.notificationRepository.findByUserId(currentUserId);
    const notificationsResult = unknownNotifications
      .map((notification) => {
        const content = ZNotification.safeParse(notification.content);
        if (!content.success) return null;
        return {
          id: notification.id,
          is_read: notification.is_read,
          event_type: notification.event_type,
          content: content.data,
          created_at: notification.created_at
        };
      })
      .filter((notification) => notification !== null);

    const notifications: Notification[] = [];

    const builder = notificationBuilder({
      bucketService: this.ctx.bucketService,
      groupRepository: this.ctx.groupRepository,
      userRepository: this.ctx.userRepository
    });

    for (const unHydratedNotification of notificationsResult) {
      const notification = await builder.getNotification(unHydratedNotification);
      if (!notification) continue;
      notifications.push(notification);
    }

    const result = { notifications };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllNotificationsResponse = ExtractControllerResponse<Controller>;
