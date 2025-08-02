export type Events = {
  connected: { message: string };
  ping: { message: string };
  groupJoinRequest: {
    adminId: string;
    groupName: string;
    createdAt: Date;
    type: "JOIN";
    userName: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
};

export type EventNames = keyof Events;
export type EventData<T extends EventNames> = Events[T];
