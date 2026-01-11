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

  public async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;

    const requests = await this.ctx.repositories.group.groupInvitation.getUserGroupsJoinRequests(currentUserId);
    const joinRequests = requests.map((r) => {
      if (r.user.avatar_url) {
        r.user.avatar_url = this.ctx.services.bucket.generatePublicUrl(r.user.avatar_url, "avatar");
      }
      return {
        id: r.id,
        created_at: r.created_at,
        sent_at: r.sent_at,
        status: r.status,
        type: r.type,
        user: {
          id: r.user.id,
          username: r.user.user_name,
          first_name: r.user.first_name,
          last_name: r.user.last_name,
          avatar_url: r.user.avatar_url
        },
        group: {
          id: r.group.id,
          name: r.group.name
        }
      };
    });

    const result = { requests: joinRequests };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetGroupJoinRequestsResponse = ExtractControllerResponse<Controller>;
