export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER"
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];
export const PostType = {
  PUBLIC: "PUBLIC",
  GROUP_ONLY: "GROUP_ONLY"
} as const;
export type PostType = (typeof PostType)[keyof typeof PostType];
export const PostStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  ARCHIVED: "ARCHIVED",
  INPROGRESS: "INPROGRESS"
} as const;
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
export const GroupType = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE"
} as const;
export type GroupType = (typeof GroupType)[keyof typeof GroupType];
export const GroupStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  INACTIVE: "INACTIVE"
} as const;
export type GroupStatus = (typeof GroupStatus)[keyof typeof GroupStatus];
export const GroupMemberRole = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  MEMBER: "MEMBER"
} as const;
export type GroupMemberRole = (typeof GroupMemberRole)[keyof typeof GroupMemberRole];
export const GroupInvitationType = {
  JOIN: "JOIN",
  INVITE: "INVITE"
} as const;
export type GroupInvitationType = (typeof GroupInvitationType)[keyof typeof GroupInvitationType];
export const NotificationType = {
  PUBLIC_POST_UPVOTE: "PUBLIC_POST_UPVOTE",
  PUBLIC_POST_COMMENT_UPVOTE: "PUBLIC_POST_COMMENT_UPVOTE",
  PUBLIC_POST_COMMENT: "PUBLIC_POST_COMMENT",
  START_FOLLOWING: "START_FOLLOWING",
  FRIEND_REQUEST: "FRIEND_REQUEST",
  FRIEND_REQUEST_ACCEPTED: "FRIEND_REQUEST_ACCEPTED",
  GROUP_POST_UPVOTE: "GROUP_POST_UPVOTE",
  GROUP_POST_COMMENT_UPVOTE: "GROUP_POST_COMMENT_UPVOTE",
  GROUP_POST_COMMENT: "GROUP_POST_COMMENT",
  GROUP_INVITATION: "GROUP_INVITATION",
  GROUP_INVITATION_ACCEPTED: "GROUP_INVITATION_ACCEPTED",
  GROUP_INVITATION_REJECTED: "GROUP_INVITATION_REJECTED",
  GROUP_JOINED: "GROUP_JOINED",
  GROUP_JOIN_REQUEST: "GROUP_JOIN_REQUEST",
  GROUP_JOIN_REQUEST_ACCEPTED: "GROUP_JOIN_REQUEST_ACCEPTED",
  GROUP_JOIN_REQUEST_REJECTED: "GROUP_JOIN_REQUEST_REJECTED"
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export const FactorType = {
  TOTP: "TOTP",
  PHONE: "PHONE",
  WEB_AUTHN: "WEB_AUTHN"
} as const;
export type FactorType = (typeof FactorType)[keyof typeof FactorType];
export const FactorStatus = {
  UNVERIFIED: "UNVERIFIED",
  VERIFIED: "VERIFIED"
} as const;
export type FactorStatus = (typeof FactorStatus)[keyof typeof FactorStatus];
export const GroupInvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED"
} as const;
export type GroupInvitationStatus = (typeof GroupInvitationStatus)[keyof typeof GroupInvitationStatus];
