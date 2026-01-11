import type { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";
import type {
  FactorStatus,
  FactorType,
  FriendType,
  Gender,
  GroupInvitationStatus,
  GroupInvitationType,
  GroupMemberRole,
  GroupStatus,
  GroupType,
  PostStatus,
  PostType
} from "./enums";

export type Timestamp = ColumnType<Date, Date | string | undefined, Date | string | undefined>;

export type ChallengeTable = {
  id: Generated<string>;
  ip: string;
  otp_code: string | null;
  factor_id: string;
  created_at: Timestamp;
  verified_at: Timestamp | null;
};
export type Challenge = Selectable<ChallengeTable>;
export type NewChallenge = Insertable<ChallengeTable>;
export type ChallengeUpdate = Updateable<ChallengeTable>;

export type CommentTable = {
  id: Generated<string>;
  text: string;
  parent_id: string | null;
  appreciated: Generated<boolean>;
  post_id: string;
  user_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Comment = Selectable<CommentTable>;
export type NewComment = Insertable<CommentTable>;
export type CommentUpdate = Updateable<CommentTable>;

export type CommentUpvoteTable = {
  id: Generated<string>;
  comment_id: string;
  post_id: string;
  user_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type CommentUpvote = Selectable<CommentUpvoteTable>;
export type NewCommentUpvote = Insertable<CommentUpvoteTable>;
export type CommentUpvoteUpdate = Updateable<CommentUpvoteTable>;

export type FactorTable = {
  id: Generated<string>;
  friendly_name: string;
  factor_type: FactorType;
  status: FactorStatus;
  secret: string;
  phone: string | null;
  last_challenged_at: Timestamp | null;
  user_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Factor = Selectable<FactorTable>;
export type NewFactor = Insertable<FactorTable>;
export type FactorUpdate = Updateable<FactorTable>;

export type FollowTable = {
  id: Generated<string>;
  follower_id: string;
  following_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Follow = Selectable<FollowTable>;
export type NewFollow = Insertable<FollowTable>;
export type FollowUpdate = Updateable<FollowTable>;

export type FriendTable = {
  id: Generated<string>;
  type: FriendType;
  user_id: string;
  friend_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Friend = Selectable<FriendTable>;
export type NewFriend = Insertable<FriendTable>;
export type FriendUpdate = Updateable<FriendTable>;

export type GroupTable = {
  id: Generated<string>;
  name: string;
  about: string;
  cover_image_url: string | null;
  logo_url: string | null;
  type: GroupType;
  status: GroupStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Group = Selectable<GroupTable>;
export type NewGroup = Insertable<GroupTable>;
export type GroupUpdate = Updateable<GroupTable>;

export type GroupAggregatesTable = {
  total_posts: Generated<number>;
  total_members: Generated<number>;
  total_comments: Generated<number>;
  total_votes: Generated<number>;
  group_id: string;
};
export type GroupAggregates = Selectable<GroupAggregatesTable>;
export type NewGroupAggregates = Insertable<GroupAggregatesTable>;
export type GroupAggregatesUpdate = Updateable<GroupAggregatesTable>;

export type GroupInvitationTable = {
  id: Generated<string>;
  type: GroupInvitationType;
  status: GroupInvitationStatus;
  sent_at: Date;
  group_id: string;
  user_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type GroupInvitation = Selectable<GroupInvitationTable>;
export type NewGroupInvitation = Insertable<GroupInvitationTable>;
export type GroupInvitationUpdate = Updateable<GroupInvitationTable>;

export type GroupMemberTable = {
  id: Generated<string>;
  role: Generated<GroupMemberRole>;
  joined_at: Date;
  blocked: Generated<boolean>;
  is_removed: Generated<boolean>;
  user_id: string;
  group_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type GroupMember = Selectable<GroupMemberTable>;
export type NewGroupMember = Insertable<GroupMemberTable>;
export type GroupMemberUpdate = Updateable<GroupMemberTable>;

export type HashTagTable = {
  id: Generated<string>;
  count: Generated<number>;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type HashTag = Selectable<HashTagTable>;
export type NewHashTag = Insertable<HashTagTable>;
export type HashTagUpdate = Updateable<HashTagTable>;

export type NotificationTable = {
  id: Generated<string>;
  source_type: string;
  source_id: string;
  user_id: string;
  creator_id: string | null;
  read_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Notification = Selectable<NotificationTable>;
export type NewNotification = Insertable<NotificationTable>;
export type NotificationUpdate = Updateable<NotificationTable>;

export type PostTable = {
  id: Generated<string>;
  title: string;
  content: string;
  slug: string;
  type: Generated<PostType>;
  status: Generated<PostStatus>;
  group_id: string | null;
  author_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Post = Selectable<PostTable>;
export type NewPost = Insertable<PostTable>;
export type PostUpdate = Updateable<PostTable>;

export type PostAggregatesTable = {
  votes: Generated<number>;
  comments: Generated<number>;
  views: Generated<number>;
  shares: Generated<number>;
  post_id: string;
};
export type PostAggregates = Selectable<PostAggregatesTable>;
export type NewPostAggregates = Insertable<PostAggregatesTable>;
export type PostAggregatesUpdate = Updateable<PostAggregatesTable>;

export type PostAssetTable = {
  id: Generated<string>;
  type: string;
  url: string;
  mime_type: string | null;
  size: number | null;
  post_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type PostAsset = Selectable<PostAssetTable>;
export type NewPostAsset = Insertable<PostAssetTable>;
export type PostAssetUpdate = Updateable<PostAssetTable>;

export type PostHashTagTable = {
  id: Generated<string>;
  post_id: string;
  hash_tag_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type PostHashTag = Selectable<PostHashTagTable>;
export type NewPostHashTag = Insertable<PostHashTagTable>;
export type PostHashTagUpdate = Updateable<PostHashTagTable>;

export type PostTopicTable = {
  post_id: string;
  topic_id: string;
};
export type PostTopic = Selectable<PostTopicTable>;
export type NewPostTopic = Insertable<PostTopicTable>;
export type PostTopicUpdate = Updateable<PostTopicTable>;

export type RefreshTokenTable = {
  id: Generated<string>;
  token: string;
  user_id: string;
  revoked: Generated<boolean>;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type RefreshToken = Selectable<RefreshTokenTable>;
export type NewRefreshToken = Insertable<RefreshTokenTable>;
export type RefreshTokenUpdate = Updateable<RefreshTokenTable>;

export type SessionTable = {
  id: Generated<string>;
  aal: Generated<string>;
  ip: string;
  user_agent: string;
  user_id: string;
  factor_id: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
export type SessionUpdate = Updateable<SessionTable>;

export type TimelineTable = {
  user_id: string;
  post_id: string;
  created_at: Timestamp;
};
export type Timeline = Selectable<TimelineTable>;
export type NewTimeline = Insertable<TimelineTable>;
export type TimelineUpdate = Updateable<TimelineTable>;

export type TopicsTable = {
  id: Generated<string>;
  name: string;
  is_system_topic: Generated<boolean>;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Topics = Selectable<TopicsTable>;
export type NewTopics = Insertable<TopicsTable>;
export type TopicsUpdate = Updateable<TopicsTable>;

export type UpvoteTable = {
  post_id: string;
  user_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type Upvote = Selectable<UpvoteTable>;
export type NewUpvote = Insertable<UpvoteTable>;
export type UpvoteUpdate = Updateable<UpvoteTable>;

export type UserTable = {
  id: Generated<string>;
  email: string;
  user_name: string;
  password: string;
  first_name: string;
  last_name: string;
  secret: string;
  about: string | null;
  twitter_profile_url: string | null;
  facebook_profile_url: string | null;
  instagram_profile_url: string | null;
  github_profile_url: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  location: string | null;
  gender: Gender | null;
  last_login: Timestamp | null;
  is_onboarded: boolean;
  is_email_verify: boolean;
  email_confirmed_at: Timestamp | null;
  email_confirmation_sent_at: Timestamp | null;
  banned_until: Timestamp | null;
  vote_bucket: number;
  last_bucket_reset_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type UserAggregatesTable = {
  total_posts: Generated<number>;
  total_votes: Generated<number>;
  total_comments: Generated<number>;
  total_followers: Generated<number>;
  total_following: Generated<number>;
  total_groups: Generated<number>;
  user_id: string;
};
export type UserAggregates = Selectable<UserAggregatesTable>;
export type NewUserAggregates = Insertable<UserAggregatesTable>;
export type UserAggregatesUpdate = Updateable<UserAggregatesTable>;

export type UserInterestsTable = {
  user_id: string;
  topic_id: string;
};
export type UserInterests = Selectable<UserInterestsTable>;
export type NewUserInterests = Insertable<UserInterestsTable>;
export type UserInterestsUpdate = Updateable<UserInterestsTable>;

export type UserSimilarityTable = {
  user_id_1: string;
  user_id_2: string;
  similarity: number;
};
export type UserSimilarity = Selectable<UserSimilarityTable>;
export type NewUserSimilarity = Insertable<UserSimilarityTable>;
export type UserSimilarityUpdate = Updateable<UserSimilarityTable>;

export type AlgoWhatsHotFeedView = {
  post_id: string;
  like_count: number;
  score: number;
};
export type AlgoWhatsHotFeed = Selectable<AlgoWhatsHotFeedView>;

export type AlgoHotUserView = {
  user_id: string;
  user_name: string;
  follower_count: number;
  score: number;
};
export type AlgoHotUser = Selectable<AlgoHotUserView>;

export type DB = {
  Challenge: ChallengeTable;
  Comment: CommentTable;
  CommentUpvote: CommentUpvoteTable;
  Factor: FactorTable;
  Follow: FollowTable;
  Friend: FriendTable;
  Group: GroupTable;
  GroupAggregates: GroupAggregatesTable;
  GroupInvitation: GroupInvitationTable;
  GroupMember: GroupMemberTable;
  HashTag: HashTagTable;
  Notification: NotificationTable;
  Post: PostTable;
  PostAggregates: PostAggregatesTable;
  PostAsset: PostAssetTable;
  PostHashTag: PostHashTagTable;
  PostTopic: PostTopicTable;
  RefreshToken: RefreshTokenTable;
  Session: SessionTable;
  Timeline: TimelineTable;
  Topics: TopicsTable;
  Upvote: UpvoteTable;
  User: UserTable;
  UserAggregates: UserAggregatesTable;
  UserInterests: UserInterestsTable;
  UserSimilarity: UserSimilarityTable;
  algohotfeedview: AlgoWhatsHotFeedView;
  algohotuserview: AlgoHotUserView;
};
