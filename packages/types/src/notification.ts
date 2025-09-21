// These types represent notification payloads that store in the database.
// notification builder uses these types to create typesafe notification payloads for notification route.

export type GroupJoinedSerialized = {
  type: "GROUP_JOINED";
  group_id: string;
  group_name: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
};

export type GroupInviteSerialized = {
  type: "GROUP_INVITATION";
  group_id: string;
  group_name: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  invitation_id: string;
};

export type GroupJoinRequestSerialized = {
  type: "GROUP_JOIN_REQUEST";
  group_id: string;
  group_name: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  user_id: string;
  invitation_id: string;
};

export type NotificationContentSerialized = GroupJoinedSerialized | GroupInviteSerialized | GroupJoinRequestSerialized;
