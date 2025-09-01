import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  bucketService: AppContext["services"]["bucket"];
};

const ZParam = z.object({
  groupId: z.string({ invalid_type_error: "groupId must be a string" })
});

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const validate = ZParam.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, validate.error?.errors[0]?.message || "Invalid request");
    const { groupId } = validate.data!;

    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;

    const _role = await this.ctx.groupRepository.groupMember.whatIsMyRole(groupId, currentUserId);
    this.ctx.assert.forbidden(!_role, "You are not a member of this group");

    const role = _role!;
    this.ctx.assert.forbidden(
      role.role !== "ADMIN" && role.role !== "MODERATOR",
      "You are not allowed to do this action"
    );

    const requests = await this.ctx.groupRepository.groupInvitation.getAllJointRequests(groupId);
    const joinRequests = requests.map((r) => {
      if (r.user.avatar_url) {
        r.user.avatar_url = this.ctx.bucketService.generatePublicUrl(r.user.avatar_url, "avatar");
      }
      return {
        id: r.id,
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
