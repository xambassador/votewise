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

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  notificationRepository: AppContext["repositories"]["notification"];
  eventBus: AppContext["eventBus"];
  userRepository: AppContext["repositories"]["user"];
  bucketService: AppContext["services"]["bucket"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(ctx: ControllerOptions) {
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
    await this.isAlreadyMember(groupId, member.id);
    await this.isAlreadyInvited(groupId, member.id, member.user_name);
    const { invitation } = await this.sendInvitation(groupId, member.id, {
      groupName: group.name,
      avatarUrl: this.ctx.bucketService.generatePublicUrl(currentUserDetails.avatar_url || "", "avatar"),
      firstName: currentUserDetails.first_name,
      lastName: currentUserDetails.last_name,
      userName: currentUserDetails.user_name,
      invitedUserId: member.id
    });

    const event = new EventBuilder("groupInviteNotification").setData({
      groupId,
      invitationId: invitation.id,
      groupName: group.name,
      type: "INVITE",
      avatarUrl: this.ctx.bucketService.generatePublicUrl(currentUserDetails.avatar_url || "", "avatar"),
      createdAt: new Date(),
      firstName: currentUserDetails.first_name,
      lastName: currentUserDetails.last_name,
      invitedUserId: member.id,
      userName: currentUserDetails.user_name
    });
    this.ctx.eventBus.emit(event.name, event.data);

    const result = { id: invitation.id };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }

  private async hasSufficientPermissions(groupId: string, userId: string) {
    const _myRole = await this.ctx.groupRepository.groupMember.whatIsMyRole(groupId, userId);
    this.ctx.assert.forbidden(!_myRole, "You are not a member of this group");
    const myRole = _myRole!;
    this.ctx.assert.forbidden(
      myRole.role !== "ADMIN" && myRole.role !== "MODERATOR",
      "You do not have sufficient permissions to invite this user to this group."
    );
    return myRole;
  }

  private async getGroup(groupId: string) {
    const _group = await this.ctx.groupRepository.findById(groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${groupId} not found`);
    const group = _group!;
    return group;
  }

  private async getUser(username: string) {
    const user = await this.ctx.userRepository.findByUsername(username);
    this.ctx.assert.resourceNotFound(!user, `User with username ${username} not found`);
    return user!;
  }

  private async isAlreadyMember(groupId: string, userId: string) {
    const isAlreadyMember = await this.ctx.groupRepository.groupMember.isMember(groupId, userId);
    this.ctx.assert.unprocessableEntity(isAlreadyMember, "This user is already a member of this group");
    return isAlreadyMember;
  }

  private async isAlreadyInvited(groupId: string, userId: string, username: string) {
    const isAlreadyInvited = await this.ctx.groupRepository.groupInvitation.findByUserWithGroup(userId, groupId);

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

  private async sendInvitation(
    groupId: string,
    userId: string,
    data: {
      groupName: string;
      avatarUrl: string;
      firstName: string;
      lastName: string;
      userName: string;
      invitedUserId: string;
    }
  ) {
    const invitation = await this.ctx.groupRepository.groupInvitation.create({
      group_id: groupId,
      user_id: userId,
      status: "PENDING",
      type: "INVITE"
    });
    const notification = await this.ctx.notificationRepository.create({
      event_id: 10,
      event_type: "GROUP_INVITATION",
      user_id: userId,
      content: {
        groupId,
        invitationId: invitation.id,
        ...data
      }
    });
    return { invitation, notification };
  }

  private async getUserById(userId: string) {
    const user = await this.ctx.userRepository.findById(userId);
    this.ctx.assert.resourceNotFound(!user, `User with id ${userId} not found`);
    return user!;
  }
}

export type SendGroupInviteResponse = ExtractControllerResponse<Controller>;
