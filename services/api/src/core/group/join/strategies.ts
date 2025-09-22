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
  aggregator: AppContext["repositories"]["aggregator"];
  transactionManager: AppContext["repositories"]["transactionManager"];
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
    const { member } = await this.ctx.transactionManager.withTransaction(async (tx) => {
      const memberPromise = this.ctx.groupRepository.groupMember.addMember(
        data.groupId,
        data.currentUserId,
        "MEMBER",
        tx
      );
      const notificationPromise = this.ctx.notificationRepository.create(
        {
          event_type: "GROUP_JOINED",
          user_id: admin.user_id,
          content: {
            type: "GROUP_JOINED",
            joinedUserId: user.id,
            groupId: data.groupId
          }
        },
        tx
      );
      const aggregatePromise = this.ctx.aggregator.groupAggregator.aggregate(
        data.groupId,
        (data) => ({
          ...data,
          total_members: (data?.total_members ?? 0) + 1
        }),
        tx
      );
      const [member] = await Promise.all([memberPromise, notificationPromise, aggregatePromise]);
      return { member };
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
    const { invitation, notification } = await this.ctx.transactionManager.withTransaction(async (tx) => {
      const invitation = await this.ctx.groupRepository.groupInvitation.create(
        {
          status: "PENDING",
          type: "JOIN",
          group_id: data.groupId,
          user_id: data.currentUserId,
          sent_at: sentAt
        },
        tx
      );
      const notification = await this.ctx.notificationRepository.create(
        {
          event_type: "GROUP_JOIN_REQUEST",
          user_id: admin.user_id,
          content: {
            type: "GROUP_JOIN_REQUEST",
            groupId: data.groupId,
            invitationId: invitation.id,
            userId: user.id
          }
        },
        tx
      );
      await this.ctx.groupRepository.groupNotifications.create(
        { group_invitation_id: invitation.id, notification_id: notification.id },
        tx
      );
      return { invitation, notification };
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
      invitationId: invitation.id,
      userId: user.id,
      notificationId: notification.id
    });
    this.ctx.eventBus.emit(event.name, event.data);
    return { id: "PENDING" };
  }
}
