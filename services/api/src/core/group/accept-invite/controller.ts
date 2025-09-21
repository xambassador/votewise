import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

const ZParams = z.object({ id: z.string({ invalid_type_error: "id must be a string" }) });
const ZQuery = z.object({
  notification_id: z.string({ invalid_type_error: "notification_id must be a string" }).optional()
});

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  notificationRepository: AppContext["repositories"]["notification"];
  transactionManager: AppContext["repositories"]["transactionManager"];
  aggregator: AppContext["repositories"]["aggregator"];
};

const invitationNotFoundMessage = "Invitation not found. It may have been revoked or expired.";
const invitationAlreadyAcceptedMessage = "This invitation has already been accepted.";
const permissionMessage = "You do not have permission to accept this invitation.";

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(ctx: ControllerOptions) {
    this.ctx = ctx;
  }

  public async handle(req: Request, res: Response) {
    const paramValidation = ZParams.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(
      !paramValidation.success,
      paramValidation.error?.errors[0]?.message || "Invalid request"
    );
    const { id: invitationId } = paramValidation.data!;

    const queryValidation = ZQuery.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(
      !queryValidation.success,
      queryValidation.error?.errors[0]?.message || "Invalid request"
    );
    const { notification_id: notificationId } = queryValidation.data!;

    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;

    const invitation = await this.ctx.groupRepository.groupInvitation.findById(invitationId);

    this.ctx.assert.resourceNotFound(!invitation, invitationNotFoundMessage);
    this.ctx.assert.unprocessableEntity(invitation!.status === "ACCEPTED", invitationAlreadyAcceptedMessage);
    this.ctx.assert.forbidden(invitation!.user_id !== currentUserId, permissionMessage);

    const groupId = invitation!.group_id;
    const userId = invitation!.user_id;

    const isAlreadyMember = await this.ctx.groupRepository.groupMember.isMember(groupId, currentUserId);
    this.ctx.assert.unprocessableEntity(isAlreadyMember, "You are already a member of this group.");

    await this.ctx.transactionManager.withTransaction(async (tx) => {
      await Promise.all([
        this.ctx.groupRepository.groupMember.addMember(groupId, userId, "MEMBER", tx),
        this.ctx.groupRepository.groupInvitation.update(invitation!.id, { status: "ACCEPTED" }, tx),
        this.ctx.aggregator.groupAggregator.aggregate(
          groupId,
          (data) => ({
            ...data,
            total_members: (data?.total_members ?? 0) + 1
          }),
          tx
        )
      ]);

      if (notificationId) {
        await this.ctx.notificationRepository.deleteById(notificationId, tx);
      }
    });

    const result = { id: invitation!.id };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type AcceptInviteResponse = ExtractControllerResponse<Controller>;
