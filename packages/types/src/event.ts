// These types are used in EventBuilder from "common/event" package for serialization and deserialization
// They represent the data that will be sent over WebSocket events

export type GroupJoinRequestPayload = {
  admin_id: string;
  group_name: string;
  group_id: string;
  created_at: Date;
  event_type: "group_join_request";
  user_name: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  invitation_id: string;
  user_id: string;
  notification_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
};

export type GroupJoinPayload = {
  admin_id: string;
  group_name: string;
  group_id: string;
  created_at: Date;
  event_type: "group_joined";
  user_name: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  notification_id: string;
};

export type GroupInviteNotificationPayload = {
  invited_user_id: string;
  group_name: string;
  group_id: string;
  created_at: Date;
  event_type: "group_invite";
  user_name: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  invitation_id: string;
};

export type NotificationCountPayload = {
  count: number;
  user_id: string;
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
