import type { AppContext } from "@/context";
import type { Group, NotificationType, User } from "@votewise/prisma/client";
import type { NotificationContentSerialized } from "@votewise/types";

import { z } from "zod";

/**
 * When a user joins a public group.
 */
const ZGroupJoined = z.object({
  type: z.literal("GROUP_JOINED"),
  groupId: z.string(),
  joinedUserId: z.string()
});

/**
 * When a user is invited to join a group
 */
const ZGroupInvite = z.object({
  type: z.literal("GROUP_INVITATION"),
  groupId: z.string(),
  invitationId: z.string(),
  userId: z.string()
});

/**
 * When a user requests to join a private group.
 */
const ZGroupJoinRequest = z.object({
  type: z.literal("GROUP_JOIN_REQUEST"),
  groupId: z.string(),
  userId: z.string(),
  invitationId: z.string()
});

export const ZNotification = z.discriminatedUnion("type", [ZGroupJoined, ZGroupInvite, ZGroupJoinRequest]);
export type NotificationContent = z.infer<typeof ZNotification>;

type NotificationBuilderOpts = {
  userRepository: AppContext["repositories"]["user"];
  groupRepository: AppContext["repositories"]["group"];
  bucketService: AppContext["services"]["bucket"];
};

type NotificationRowValidatedInput = {
  content: NotificationContent;
  id: string;
  is_read: boolean;
  event_type: NotificationType;
  created_at: Date;
};

export type Notification = {
  id: string;
  content: NotificationContentSerialized;
  is_read: boolean;
  event_type: NotificationType;
  created_at: Date;
};

export function notificationBuilder(opts: NotificationBuilderOpts) {
  const users = new Map<string, User>();
  const groups = new Map<string, Group>();
  const { userRepository, groupRepository, bucketService } = opts;

  async function readThroughGroup(groupId: string) {
    const cachedGroup = groups.get(groupId);
    if (cachedGroup) return cachedGroup;
    const group = await groupRepository.findById(groupId);
    if (!group) return null;
    groups.set(groupId, group);
    return group;
  }

  async function readThroughUser(userId: string) {
    const cachedUser = users.get(userId);
    if (cachedUser) return cachedUser;
    const user = await userRepository.findById(userId);
    if (!user) return null;
    users.set(userId, user);
    return user;
  }

  async function getNotification(notification: NotificationRowValidatedInput): Promise<Notification | null> {
    if (notification.content.type === "GROUP_JOIN_REQUEST") {
      const { groupId, invitationId, userId } = notification.content;
      const notificationData: Notification = {
        id: notification.id,
        is_read: notification.is_read,
        event_type: notification.event_type,
        created_at: notification.created_at,
        content: {
          type: "GROUP_JOIN_REQUEST",
          invitation_id: invitationId,
          group_id: groupId,
          group_name: "",
          user_id: userId,
          avatar_url: "",
          first_name: "",
          last_name: "",
          username: ""
        }
      };
      const group = await readThroughGroup(groupId);
      const user = await readThroughUser(userId);
      if (!group || !user) return null;
      notificationData.content.group_name = group.name;
      notificationData.content.avatar_url = bucketService.generatePublicUrl(user.avatar_url ?? "", "avatar");
      notificationData.content.first_name = user.first_name;
      notificationData.content.last_name = user.last_name;
      notificationData.content.username = user.user_name;
      return notificationData;
    }

    if (notification.content.type === "GROUP_INVITATION") {
      const { groupId, invitationId, userId } = notification.content;
      const notificationData: Notification = {
        id: notification.id,
        is_read: notification.is_read,
        event_type: notification.event_type,
        created_at: notification.created_at,
        content: {
          type: "GROUP_INVITATION",
          invitation_id: invitationId,
          group_id: groupId,
          group_name: "",
          avatar_url: "",
          first_name: "",
          last_name: "",
          username: ""
        }
      };

      const group = await readThroughGroup(groupId);
      const user = await readThroughUser(userId);
      if (!group || !user) return null;
      notificationData.content.group_name = group.name;
      notificationData.content.avatar_url = bucketService.generatePublicUrl(user.avatar_url ?? "", "avatar");
      notificationData.content.first_name = user.first_name;
      notificationData.content.last_name = user.last_name;
      notificationData.content.username = user.user_name;
      return notificationData;
    }

    if (notification.content.type === "GROUP_JOINED") {
      const { groupId, joinedUserId } = notification.content;
      const notificationData: Notification = {
        id: notification.id,
        is_read: notification.is_read,
        event_type: notification.event_type,
        created_at: notification.created_at,
        content: {
          type: "GROUP_JOINED",
          group_id: groupId,
          group_name: "",
          avatar_url: "",
          first_name: "",
          last_name: "",
          username: ""
        }
      };
      const group = await readThroughGroup(groupId);
      const user = await readThroughUser(joinedUserId);
      if (!group || !user) return null;
      notificationData.content.group_name = group.name;
      notificationData.content.avatar_url = bucketService.generatePublicUrl(user.avatar_url ?? "", "avatar");
      notificationData.content.first_name = user.first_name;
      notificationData.content.last_name = user.last_name;
      notificationData.content.username = user.user_name;
      return notificationData;
    }

    return null;
  }

  return { getNotification };
}
