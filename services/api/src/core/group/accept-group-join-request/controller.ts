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
  transactionManager: AppContext["repositories"]["transactionManager"];
  aggregator: AppContext["repositories"]["aggregator"];
};

const ZParams = z.object({ id: z.string({ invalid_type_error: "id must be a string" }) });
const permissionErrorMessage = "You have no permission to do this";

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
    const userId = joinRequest!.user_id;

    const role = await this.ctx.groupRepository.groupMember.whatIsMyRole(groupId, currentUserId);
    this.ctx.assert.forbidden(!role || (role.role !== "ADMIN" && role.role !== "MODERATOR"), permissionErrorMessage);

    const isAlreadyMember = await this.ctx.groupRepository.groupMember.isMember(groupId, userId);
    if (isAlreadyMember) {
      await this.ctx.groupRepository.groupInvitation.update(joinRequestId, { status: "ACCEPTED" });
      const result = { id: joinRequestId };
      return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
    }

    await this.ctx.transactionManager.withTransaction(async (tx) => {
      await Promise.all([
        this.ctx.groupRepository.groupInvitation.update(joinRequestId, { status: "ACCEPTED" }, tx),
        this.ctx.groupRepository.groupMember.addMember(groupId, userId, "MEMBER", tx),
        this.ctx.aggregator.groupAggregator.aggregate(
          groupId,
          (data) => ({
            ...data,
            total_members: (data?.total_members ?? 0) + 1
          }),
          tx
        ),
        joinRequest?.groupNotification?.notification_id
          ? this.ctx.notificationRepository.deleteById(joinRequest.groupNotification.notification_id)
          : Promise.resolve()
      ]);
    });

    const result = { id: joinRequestId };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type AcceptGroupJoinRequestResponse = ExtractControllerResponse<Controller>;
