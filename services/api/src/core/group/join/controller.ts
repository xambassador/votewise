import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";
import type { Strategy } from "./strategies";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = AppContext & { strategies: Record<"public" | "private", Strategy> };

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

    const _group = await this.ctx.repositories.group.findById(data.groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${data.groupId} not found`);
    const group = _group!;

    const isJoinable = group.status === "OPEN";
    const isPrivateGroup = group.type === "PRIVATE";
    this.ctx.assert.unprocessableEntity(!isJoinable, "This group is not open for joining");

    const isAlreadyMember = await this.ctx.repositories.group.groupMember.isMember(data.groupId, currentUserId);
    this.ctx.assert.unprocessableEntity(isAlreadyMember, "You are already a member of this group");

    if (isPrivateGroup) {
      const result = await this.ctx.strategies.private.handle({ group, groupId: data.groupId, currentUserId });
      return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
    }

    const result = await this.ctx.strategies.public.handle({ group, groupId: data.groupId, currentUserId });
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type JoinGroupResponse = ExtractControllerResponse<Controller>;
