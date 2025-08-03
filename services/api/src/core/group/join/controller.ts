import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { EventBuilder } from "@votewise/event";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  notificationRepository: AppContext["repositories"]["notification"];
  eventBus: AppContext["eventBus"];
  userRepository: AppContext["repositories"]["user"];
  bucketService: AppContext["services"]["bucket"];
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

    const isPrivateGroup = group.type === "PRIVATE";

    if (isPrivateGroup) {
      const isAlreadySent = await this.ctx.groupRepository.groupInvitation.findByUserWithGroup(
        currentUserId,
        data.groupId
      );
      this.ctx.assert.unprocessableEntity(!!isAlreadySent, `You have already sent a join request to this group`);

      const _admin = await this.ctx.groupRepository.groupMember.getAdmin(data.groupId);
      // A group without an admin ???? huh.. 🤔
      this.ctx.assert.unprocessableEntity(!_admin, `This should not happen`);
      const admin = _admin!;
      const _me = await this.ctx.userRepository.findById(currentUserId);
      this.ctx.assert.resourceNotFound(!_me, `User with id ${currentUserId} not found`);
      const me = _me!;

      const sentAt = new Date();
      await this.ctx.groupRepository.groupInvitation.create({
        status: "PENDING",
        type: "JOIN",
        group_id: data.groupId,
        user_id: currentUserId,
        sent_at: sentAt
      });

      const event = new EventBuilder("groupJoinRequest").setData({
        adminId: admin.user_id,
        avatarUrl: this.ctx.bucketService.generatePublicUrl(me.avatar_url ?? "", "avatar"),
        createdAt: sentAt,
        firstName: me.first_name,
        lastName: me.last_name,
        groupName: group.name,
        type: "JOIN",
        userName: me.user_name
      });
      this.ctx.eventBus.emit(event.name, event.data);

      const result = { id: "PENDING" };
      return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
    }

    const member = await this.ctx.groupRepository.groupMember.addMember(data.groupId, currentUserId, "MEMBER");

    const result = { id: member.id };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type JoinGroupControllerResponse = ExtractControllerResponse<Controller>;
