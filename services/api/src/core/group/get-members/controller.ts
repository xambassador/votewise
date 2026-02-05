import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

const ZQuery = z.object({ groupId: z.string() });

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const validate = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const query = validate.data!;

    const membersResult = await this.ctx.repositories.group.groupMember.getMembers(query.groupId);
    const members = membersResult.map((member) => ({
      id: member.id,
      role: member.role,
      joined_at: member.joined_at,
      user: {
        id: member.user.id,
        avatar_url: member.user.avatar_url,
        first_name: member.user.first_name,
        last_name: member.user.last_name,
        user_name: member.user.user_name
      }
    }));
    const result = { members };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetGroupMembersResponse = ExtractControllerResponse<Controller>;
