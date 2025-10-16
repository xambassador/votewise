import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

const ZQuery = z.object({ groupId: z.string() });
const canNotLeaveAsAdminMsg = `You are not allowed to leave this group as you are an admin. Please assign a new admin before leaving.`;
const memberNotInGroupMessage = `Invalid request, you are not a member of this group`;

export class Controller {
  private readonly ctx: AppContext;

  constructor(ctx: AppContext) {
    this.ctx = ctx;
  }

  public async handle(req: Request, res: Response) {
    const query = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!query.success, "Invalid request");
    const { groupId } = query.data!;
    const locals = getAuthenticateLocals(res);

    const _group = await this.ctx.repositories.group.findById(groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${groupId} not exist`);

    const _role = await this.ctx.repositories.group.groupMember.whatIsMyRole(groupId, locals.payload.sub);
    this.ctx.assert.unprocessableEntity(!_role, memberNotInGroupMessage);
    const role = _role!;
    this.ctx.assert.unprocessableEntity(role.role === "ADMIN", canNotLeaveAsAdminMsg);

    const { member } = await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
      const memberPromise = this.ctx.repositories.group.groupMember.leaveGroup(groupId, locals.payload.sub, tx);
      const aggregatePromise = this.ctx.repositories.aggregator.groupAggregator.aggregate(
        groupId,
        (data) => ({
          ...data,
          total_members: (data?.total_members ?? 1) - 1
        }),
        tx
      );
      const [member] = await Promise.all([memberPromise, aggregatePromise]);
      return { member };
    });
    const result = { id: member.id };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type LeaveGroupResponse = ExtractControllerResponse<Controller>;
