import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

const ZParams = z.object({
  id: z.string({ invalid_type_error: "id must be a string" })
});
const ZQuery = z.object({
  notification_id: z.string({ invalid_type_error: "notification_id must be a string" }).optional()
});

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  notificationRepository: AppContext["repositories"]["notification"];
  transactionManager: AppContext["repositories"]["transactionManager"];
};

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

    const _invitation = await this.ctx.groupRepository.groupInvitation.findById(invitationId);
    this.ctx.assert.resourceNotFound(!_invitation, "Invitation not found. It may have been revoked or expired.");
    const invitation = _invitation!;
    this.ctx.assert.unprocessableEntity(invitation.status === "ACCEPTED", "This invitation has already been accepted.");

    this.ctx.assert.forbidden(
      invitation.user_id !== currentUserId,
      "You do not have permission to accept this invitation."
    );

    const isAlreadyMember = await this.ctx.groupRepository.groupMember.isMember(invitation.group_id, currentUserId);
    this.ctx.assert.unprocessableEntity(isAlreadyMember, "You are already a member of this group.");

    await this.ctx.transactionManager.withTransaction(async (tx) => {
      await this.ctx.groupRepository.groupMember.addMember(invitation.group_id, invitation.user_id, "MEMBER", tx);
      await this.ctx.groupRepository.groupInvitation.update(invitation.id, { status: "ACCEPTED" }, tx);
      if (notificationId) {
        await this.ctx.notificationRepository.markAsRead(notificationId, tx);
      }
    });

    const result = { id: invitation.id };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type AcceptInviteResponse = ExtractControllerResponse<Controller>;
