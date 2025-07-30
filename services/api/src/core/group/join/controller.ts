import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
};

const ZQuery = z.object({ groupId: z.string({ invalid_type_error: "groupId must be a string" }) });

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(ctx: ControllerOptions) {
    this.ctx = ctx;
  }

  public async handle(req: Request, res: Response) {
    const groupId = req.params.groupId;
    const validate = ZQuery.safeParse({ groupId });
    this.ctx.assert.unprocessableEntity(!validate.success, validate.error?.errors[0]?.message || "Invalid request");
    const data = validate.data!;

    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;

    const _group = await this.ctx.groupRepository.findById(data.groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${data.groupId} not found`);
    const group = _group!;

    const isAlreadyMember = await this.ctx.groupRepository.groupMember.isMember(data.groupId, currentUserId);
    this.ctx.assert.unprocessableEntity(isAlreadyMember, "You are already a member of this group");

    const isJoinable = group.status === "OPEN";
    this.ctx.assert.unprocessableEntity(!isJoinable, "This group is not open for joining");

    const member = await this.ctx.groupRepository.groupMember.addMember(data.groupId, currentUserId, "MEMBER");

    const result = { id: member.id };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type JoinGroupControllerResponse = ExtractControllerResponse<Controller>;
