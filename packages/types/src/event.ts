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

export type Events = {
  connected: { message: string };
  ping: { message: string };
  groupJoinRequestNotification: GroupJoinRequestPayload;
  groupJoinNotification: GroupJoinPayload;
  groupInviteNotification: GroupInviteNotificationPayload;
};

export type EventNames = keyof Events;
export type EventData<T extends EventNames> = Events[T] & { event: T };
