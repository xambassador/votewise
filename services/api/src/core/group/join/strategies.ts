import type { AppContext } from "@/context";
import type { Group } from "@votewise/prisma/client";

import { EventBuilder } from "@votewise/event";

type Result = { id: string };

export type StrategyOptions = {
  groupRepository: AppContext["repositories"]["group"];
  userRepository: AppContext["repositories"]["user"];
  notificationRepository: AppContext["repositories"]["notification"];
  eventBus: AppContext["eventBus"];
  bucketService: AppContext["services"]["bucket"];
  assert: AppContext["assert"];
};

export abstract class Strategy {
  protected readonly ctx: StrategyOptions;

  constructor(ctx: StrategyOptions) {
    this.ctx = ctx;
  }

  public abstract handle(data: { group: Group; groupId: string; currentUserId: string }): Promise<Result>;

  protected async getAdmin(groupId: string) {
    const _admin = await this.ctx.groupRepository.groupMember.getAdmin(groupId);
    this.ctx.assert.unprocessableEntity(!_admin, `This should not happen`);
    return _admin!;
  }

  protected async getUser(userId: string) {
    const user = await this.ctx.userRepository.findById(userId);
    this.ctx.assert.resourceNotFound(!user, `User with id ${userId} not found`);
    return user!;
  }
}

export class PublicGroupStrategy extends Strategy {
  constructor(opts: StrategyOptions) {
    super(opts);
  }

  public override async handle(data: { group: Group; groupId: string; currentUserId: string }): Promise<Result> {
    const admin = await this.getAdmin(data.groupId);
    const user = await this.getUser(data.currentUserId);
    const member = await this.ctx.groupRepository.groupMember.addMember(data.groupId, data.currentUserId, "MEMBER");
    await this.ctx.notificationRepository.create({
      event_id: 10,
      event_type: "GROUP_JOINED",
      user_id: admin.user_id,
      content: {
        type: "GROUP_JOINED",
        joinedUserId: user.id,
        groupId: data.groupId
      }
    });
    const event = new EventBuilder("groupJoinNotification").setData({
      adminId: admin.user_id,
      avatarUrl: this.ctx.bucketService.generatePublicUrl(user.avatar_url ?? "", "avatar"),
      firstName: user.first_name,
      lastName: user.last_name,
      groupName: data.group.name,
      type: "JOIN",
      userName: user.user_name,
      createdAt: new Date(),
      groupId: data.groupId
    });
    this.ctx.eventBus.emit(event.name, event.data);
    return { id: member.id };
  }
}

export class PrivateGroupStrategy extends Strategy {
  constructor(opts: StrategyOptions) {
    super(opts);
  }

  public override async handle(data: { group: Group; groupId: string; currentUserId: string }): Promise<Result> {
    const admin = await this.getAdmin(data.groupId);
    const user = await this.getUser(data.currentUserId);
    const isAlreadySent = await this.ctx.groupRepository.groupInvitation.findByUserWithGroup(
      data.currentUserId,
      data.groupId
    );
    this.ctx.assert.unprocessableEntity(!!isAlreadySent, `You have already sent a join request to this group`);
    const sentAt = new Date();
    const invitation = await this.ctx.groupRepository.groupInvitation.create({
      status: "PENDING",
      type: "JOIN",
      group_id: data.groupId,
      user_id: data.currentUserId,
      sent_at: sentAt
    });
    await this.ctx.notificationRepository.create({
      event_id: 10,
      event_type: "JOIN_GROUP_REQUEST",
      user_id: admin.user_id,
      content: {
        type: "GROUP_JOIN_REQUEST",
        groupId: data.groupId,
        invitationId: invitation.id,
        userId: user.id
      }
    });
    const event = new EventBuilder("groupJoinRequestNotification").setData({
      adminId: admin.user_id,
      avatarUrl: this.ctx.bucketService.generatePublicUrl(user.avatar_url ?? "", "avatar"),
      createdAt: sentAt,
      firstName: user.first_name,
      lastName: user.last_name,
      groupName: data.group.name,
      type: "JOIN",
      userName: user.user_name,
      groupId: data.groupId,
      invitationId: invitation.id
    });
    this.ctx.eventBus.emit(event.name, event.data);
    return { id: "PENDING" };
  }
}
