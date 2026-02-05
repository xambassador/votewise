import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Group, GroupInvitation } from "@votewise/db/db";
import type { GroupJoinPayload, GroupJoinRequestPayload } from "@votewise/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(ctx: AppContext) {
    this.ctx = ctx;
  }

  public async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;
    const skeleton = await this.ctx.repositories.notification.findByUserId(currentUserId);
    const notificationPromises = skeleton.map(async (s) => {
      if (s.source_type === "GroupJoin") {
        const groups = await this.ctx.repositories.notification.buildNotificationFromSource<Group>(
          "Group",
          s.source_id!
        );
        const group = groups[0];
        if (!group) return null;
        return {
          admin_id: group.id, // @todo
          group_id: group.id,
          group_name: group.name,
          created_at: s.created_at,
          event_type: "group_joined",
          user_name: s.user_name,
          first_name: s.first_name,
          last_name: s.last_name,
          avatar_url: s.avatar_url,
          notification_id: s.id
        } as GroupJoinPayload;
      }

      if (s.source_type === "GroupJoinRequest") {
        const groupInvitations = await this.ctx.repositories.notification.buildNotificationFromSource<GroupInvitation>(
          "GroupInvitation",
          s.source_id!
        );
        const groupInvitation = groupInvitations[0];
        if (!groupInvitation) return null;
        const groups = await this.ctx.repositories.notification.buildNotificationFromSource<Group>(
          "Group",
          groupInvitation.group_id
        );
        const group = groups[0];
        if (!group) return null;
        return {
          admin_id: groupInvitation.user_id, // @todo
          group_id: group.id,
          group_name: group.name,
          avatar_url: s.avatar_url,
          first_name: s.first_name,
          last_name: s.last_name,
          user_name: s.user_name,
          event_type: "group_join_request",
          created_at: s.created_at,
          notification_id: s.id,
          invitation_id: groupInvitation.id,
          user_id: groupInvitation.user_id,
          status: groupInvitation.status
        } as GroupJoinRequestPayload;
      }

      return null;
    });

    const notifications = await Promise.all(notificationPromises);

    const result = { notifications: notifications.filter((n) => n !== null) };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllNotificationsResponse = ExtractControllerResponse<Controller>;
