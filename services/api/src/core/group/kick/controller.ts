import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

const ZQuery = z.object({ groupId: z.string(), username: z.string() });
const memberNotInGroupMessage = `Invalid request, you are not a member of this group`;
const userNotMemberMessage = "User is not a member of this group";
const permissionError = "You are not allowed to kick members from this group";

export class Controller {
  private readonly ctx: AppContext;

  constructor(ctx: AppContext) {
    this.ctx = ctx;
  }

  public async handle(req: Request, res: Response) {
    const query = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!query.success, "Invalid request");
    const { groupId, username } = query.data!;
    const locals = getAuthenticateLocals(res);

    const _group = await this.ctx.repositories.group.findById(groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${groupId} not exist`);

    const _user = await this.ctx.repositories.user.findByUsername(username);
    const user = _user!;

    this.ctx.assert.resourceNotFound(!_user, `User with username ${username} not exist`);
    this.ctx.assert.unprocessableEntity(user.id === locals.payload.sub, "You cannot kick yourself.");

    const isMember = await this.ctx.repositories.group.groupMember.isMember(groupId, user.id);
    this.ctx.assert.unprocessableEntity(!isMember, userNotMemberMessage);

    const _role = await this.ctx.repositories.group.groupMember.whatIsMyRole(groupId, locals.payload.sub);
    const role = _role!;

    this.ctx.assert.unprocessableEntity(!_role, memberNotInGroupMessage);
    this.ctx.assert.forbidden(role.role !== "ADMIN", permissionError);

    await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
      await Promise.all([
        this.ctx.repositories.group.groupMember.kick(groupId, locals.payload.sub, tx),
        this.ctx.repositories.aggregator.groupAggregator.aggregate(
          groupId,
          (data) => ({
            ...data,
            total_members: (data?.total_members ?? 0) + 1
          }),
          tx
        )
      ]);
    });

    return res.status(StatusCodes.NO_CONTENT).send() as Response<null>;
  }
}

export type KickMemberResponse = ExtractControllerResponse<Controller>;
