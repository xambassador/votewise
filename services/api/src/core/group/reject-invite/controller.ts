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

const invitationNotFoundMessage = "Invitation not found. It may have been revoked or expired.";
const acceptedInvitationMessage = "This invitation has already been accepted.";
const invitationRejectedMessage = "This invitation has already been rejected.";
const permissionErrorMessage = "You do not have permission to reject this invitation.";

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
    this.ctx.assert.unprocessableEntity(invitation!.status === "ACCEPTED", acceptedInvitationMessage);
    this.ctx.assert.unprocessableEntity(invitation!.status === "REJECTED", invitationRejectedMessage);
    this.ctx.assert.forbidden(invitation!.user_id !== currentUserId, permissionErrorMessage);

    await this.ctx.transactionManager.withTransaction(async (tx) => {
      let deletePromise: Promise<void> = Promise.resolve();
      if (notificationId) {
        deletePromise = this.ctx.notificationRepository.deleteById(notificationId, tx);
      }
      await Promise.all([
        this.ctx.groupRepository.groupInvitation.update(invitation!.id, { status: "REJECTED" }, tx),
        deletePromise
      ]);
    });

    return res.status(StatusCodes.NO_CONTENT).send();
  }
}

export type RejectInviteResponse = ExtractControllerResponse<Controller>;
