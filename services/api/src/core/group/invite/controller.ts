import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { EventBuilder } from "@votewise/event";
import { Hour } from "@votewise/times";

import { getAuthenticateLocals } from "@/utils/locals";

const ZQuery = z.object({
  groupId: z.string({ invalid_type_error: "groupId must be a string" }),
  username: z.string({ invalid_type_error: "username must be a string" })
});

export class Controller {
  private readonly ctx: AppContext;

  constructor(ctx: AppContext) {
    this.ctx = ctx;
  }

  public async handle(req: Request, res: Response) {
    const validate = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, validate.error?.errors[0]?.message || "Invalid request");
    const { groupId, username } = validate.data!;

    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;

    await this.hasSufficientPermissions(groupId, currentUserId);
    const currentUserDetails = await this.getUserById(currentUserId);
    const group = await this.getGroup(groupId);
    const member = await this.getUser(username);

    this.ctx.assert.unprocessableEntity(member.id === currentUserId, "You cannot invite yourself");

    await this.isAlreadyMember(groupId, member.id);
    await this.isAlreadyInvited(groupId, member.id, member.user_name);
    const { invitation } = await this.sendInvitation(groupId, member.id, currentUserDetails.id);

    const event = new EventBuilder("groupInviteNotification").setData({
      group_id: groupId,
      invitation_id: invitation.id,
      group_name: group.name,
      event_type: "group_invite",
      avatar_url: currentUserDetails.avatar_url ?? "",
      created_at: new Date(),
      first_name: currentUserDetails.first_name,
      last_name: currentUserDetails.last_name,
      invited_user_id: member.id,
      user_name: currentUserDetails.user_name
    });
    this.ctx.eventBus.emit(event.name, event.data);

    const result = { id: invitation.id };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }

  private async hasSufficientPermissions(groupId: string, userId: string) {
    const _myRole = await this.ctx.repositories.group.groupMember.whatIsMyRole(groupId, userId);
    this.ctx.assert.forbidden(!_myRole, "You are not a member of this group");
    const myRole = _myRole!;
    this.ctx.assert.forbidden(
      myRole.role !== "ADMIN" && myRole.role !== "MODERATOR",
      "You do not have sufficient permissions to invite this user to this group."
    );
    return myRole;
  }

  private async getGroup(groupId: string) {
    const _group = await this.ctx.repositories.group.findById(groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${groupId} not found`);
    const group = _group!;
    return group;
  }

  private async getUser(username: string) {
    const user = await this.ctx.repositories.user.findByUsername(username);
    this.ctx.assert.resourceNotFound(!user, `User with username ${username} not found`);
    return user!;
  }

  private async isAlreadyMember(groupId: string, userId: string) {
    const isAlreadyMember = await this.ctx.repositories.group.groupMember.isMember(groupId, userId);
    this.ctx.assert.unprocessableEntity(isAlreadyMember, "This user is already a member of this group");
    return isAlreadyMember;
  }

  private async isAlreadyInvited(groupId: string, userId: string, username: string) {
    const isAlreadyInvited = await this.ctx.repositories.group.groupInvitation.findByUserWithGroup(userId, groupId);

    this.ctx.assert.unprocessableEntity(
      !!isAlreadyInvited && isAlreadyInvited.status === "ACCEPTED",
      `User ${username} is already a member of this group`
    );
    this.ctx.assert.unprocessableEntity(
      !!isAlreadyInvited && isAlreadyInvited.status === "PENDING",
      `User ${username} has already been invited to this group`
    );

    if (isAlreadyInvited) {
      const lastSentAt = isAlreadyInvited.sent_at;
      const now = new Date();
      const timeSinceLastSent = now.getTime() - lastSentAt.getTime();
      const isWithinCooldownPeriod = timeSinceLastSent < 24 * Hour;
      this.ctx.assert.unprocessableEntity(
        isAlreadyInvited && isAlreadyInvited.status === "REJECTED" && isWithinCooldownPeriod,
        `You can only send a new invitation after 24 hours`
      );
    }
  }

  private async sendInvitation(groupId: string, userId: string, currentUserId: string) {
    const invitation = await this.ctx.repositories.group.groupInvitation.create({
      group_id: groupId,
      user_id: userId,
      status: "PENDING",
      type: "INVITE",
      sent_at: new Date()
    });
    const notification = await this.ctx.repositories.notification.create({
      source_id: invitation.id,
      source_type: "GroupJoinInvitation",
      user_id: userId,
      creator_id: currentUserId
    });
    return { invitation, notification };
  }

  private async getUserById(userId: string) {
    const user = await this.ctx.repositories.user.findById(userId);
    this.ctx.assert.resourceNotFound(!user, `User with id ${userId} not found`);
    return user!;
  }
}

export type SendGroupInviteResponse = ExtractControllerResponse<Controller>;
