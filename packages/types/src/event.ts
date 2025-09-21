// These types are used in EventBuilder from "common/event" package for serialization and deserialization
// They represent the data that will be sent over WebSocket events

export type GroupJoinRequestPayload = {
  adminId: string;
  groupName: string;
  groupId: string;
  createdAt: Date;
  type: "JOIN";
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  invitationId: string;
  userId: string;
  notificationId: string;
};

export type GroupJoinPayload = {
  adminId: string;
  groupName: string;
  groupId: string;
  createdAt: Date;
  type: "JOIN";
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
};

export type GroupInviteNotificationPayload = {
  invitedUserId: string;
  groupName: string;
  groupId: string;
  createdAt: Date;
  type: "INVITE";
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  invitationId: string;
};

export type NotificationCountPayload = {
  count: number;
  userId: string;
};

export type Events = {
  connected: { message: string };
  ping: { message: string };
  groupJoinRequestNotification: GroupJoinRequestPayload;
  groupJoinNotification: GroupJoinPayload;
  groupInviteNotification: GroupInviteNotificationPayload;
  notificationCount: NotificationCountPayload;
};

export type EventNames = keyof Events;
export type EventData<T extends EventNames> = Events[T] & { event: T };
export type DeserializedEvent = { data: EventData<EventNames>; success: true } | { error: string; success: false };
