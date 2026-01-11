import type { AppContext } from "@/context";
import type { Group } from "@votewise/prisma/client";

import { EventBuilder } from "@votewise/event";

type Result = { id: string };

export abstract class Strategy {
  protected readonly ctx: AppContext;

  constructor(ctx: AppContext) {
    this.ctx = ctx;
  }

  public abstract handle(data: { group: Group; groupId: string; currentUserId: string }): Promise<Result>;

  protected async getAdmin(groupId: string) {
    const _admin = await this.ctx.repositories.group.groupMember.getAdmin(groupId);
    this.ctx.assert.unprocessableEntity(!_admin, `This should not happen`);
    return _admin!;
  }

  protected async getUser(userId: string) {
    const user = await this.ctx.repositories.user.findById(userId);
    this.ctx.assert.resourceNotFound(!user, `User with id ${userId} not found`);
    return user!;
  }
}

export class PublicGroupStrategy extends Strategy {
  constructor(opts: AppContext) {
    super(opts);
  }

  public override async handle(data: { group: Group; groupId: string; currentUserId: string }): Promise<Result> {
    const admin = await this.getAdmin(data.groupId);
    const user = await this.getUser(data.currentUserId);
    const { member, notification } = await this.ctx.repositories.transactionManager.withDataLayerTransaction(
      async (tx) => {
        const memberPromise = this.ctx.repositories.group.groupMember.addMember(
          data.groupId,
          data.currentUserId,
          "MEMBER",
          tx
        );
        const notificationPromise = this.ctx.repositories.notification.create(
          {
            source_id: data.groupId,
            source_type: "GroupJoin",
            user_id: admin.user_id,
            creator_id: data.currentUserId
          },
          tx
        );
        const aggregatePromise = this.ctx.repositories.aggregator.groupAggregator.aggregate(
          data.groupId,
          (data) => ({
            ...data,
            total_members: (data?.total_members ?? 0) + 1
          }),
          tx
        );
        const [member, notification] = await Promise.all([memberPromise, notificationPromise, aggregatePromise]);
        return { member, notification };
      }
    );
    const event = new EventBuilder("groupJoinNotification").setData({
      admin_id: admin.user_id,
      avatar_url: this.ctx.services.bucket.generatePublicUrl(user.avatar_url ?? "", "avatar"),
      first_name: user.first_name,
      last_name: user.last_name,
      group_name: data.group.name,
      event_type: "group_joined",
      user_name: user.user_name,
      created_at: new Date(),
      group_id: data.groupId,
      notification_id: notification.id
    });
    this.ctx.eventBus.emit(event.name, event.data);
    return { id: member.id };
  }
}

export class PrivateGroupStrategy extends Strategy {
  constructor(opts: AppContext) {
    super(opts);
  }

  public override async handle(data: { group: Group; groupId: string; currentUserId: string }): Promise<Result> {
    const admin = await this.getAdmin(data.groupId);
    const user = await this.getUser(data.currentUserId);
    const isAlreadySent = await this.ctx.repositories.group.groupInvitation.findByUserWithGroup(
      data.currentUserId,
      data.groupId
    );
    this.ctx.assert.unprocessableEntity(!!isAlreadySent, `You have already sent a join request to this group`);
    const sentAt = new Date();
    const { invitation, notification } = await this.ctx.repositories.transactionManager.withDataLayerTransaction(
      async (tx) => {
        const invitation = await this.ctx.repositories.group.groupInvitation.create(
          {
            status: "PENDING",
            type: "JOIN",
            group_id: data.groupId,
            user_id: data.currentUserId,
            sent_at: sentAt
          },
          tx
        );
        const notification = await this.ctx.repositories.notification.create(
          {
            source_id: invitation.id,
            source_type: "GroupJoinRequest",
            user_id: admin.user_id,
            creator_id: data.currentUserId
          },
          tx
        );
        return { invitation, notification };
      }
    );
    const event = new EventBuilder("groupJoinRequestNotification").setData({
      admin_id: admin.user_id,
      avatar_url: this.ctx.services.bucket.generatePublicUrl(user.avatar_url ?? "", "avatar"),
      created_at: sentAt,
      first_name: user.first_name,
      last_name: user.last_name,
      group_name: data.group.name,
      event_type: "group_join_request",
      user_name: user.user_name,
      group_id: data.groupId,
      invitation_id: invitation.id,
      user_id: user.id,
      notification_id: notification.id,
      status: invitation.status
    });
    this.ctx.eventBus.emit(event.name, event.data);
    return { id: "PENDING" };
  }
}
