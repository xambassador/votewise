import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  notificationRepository: AppContext["repositories"]["notification"];
};

const ZParams = z.object({ id: z.string({ invalid_type_error: "id must be a string" }) });

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(ctx: ControllerOptions) {
    this.ctx = ctx;
  }

  public async handle(req: Request, res: Response) {
    const validate = ZParams.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, validate.error?.errors[0]?.message || "Invalid request");
    const { id: joinRequestId } = validate.data!;

    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;

    const joinRequest = await this.ctx.groupRepository.groupInvitation.findPendingJoinRequest(joinRequestId);
    this.ctx.assert.resourceNotFound(!joinRequest, "Join request not found");

    const groupId = joinRequest!.group_id;

    const role = await this.ctx.groupRepository.groupMember.whatIsMyRole(groupId, currentUserId);
    this.ctx.assert.forbidden(
      !role || (role.role !== "ADMIN" && role.role !== "MODERATOR"),
      "You have no permission to do this"
    );

    await this.ctx.groupRepository.groupInvitation.update(joinRequestId, { status: "REJECTED" });

    const result = { id: joinRequestId };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type RejectGroupJoinRequestResponse = ExtractControllerResponse<Controller>;
