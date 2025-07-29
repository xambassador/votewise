import type { AppContext } from "@/context";

import { ChallengeRepository } from "./challenge.repository";
import { CommentRepository } from "./comment.repository";
import { FactorRepository } from "./factor.repository";
import { FeedAssetRepository } from "./feed-asset.repository";
import { FeedRepository } from "./feed.repository";
import { FollowRepository } from "./follow.repository";
import { GroupRepository } from "./group.repository";
import { PostTopicRepository } from "./post-topic.repository";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { SessionRepository } from "./session.repository";
import { TimelineRepository } from "./timeline.repository";
import { TopicRepository } from "./topic.repository";
import { UserInterestRepository } from "./user-interest.repository";
import { UserRepository } from "./user.repository";

export {
  ChallengeRepository,
  FactorRepository,
  FeedAssetRepository,
  FeedRepository,
  FollowRepository,
  RefreshTokenRepository,
  SessionRepository,
  TimelineRepository,
  TopicRepository,
  UserInterestRepository,
  UserRepository,
  PostTopicRepository,
  GroupRepository,
  CommentRepository
};

declare global {
  interface Repositories {
    user: UserRepository;
    factor: FactorRepository;
    challenge: ChallengeRepository;
    refreshToken: RefreshTokenRepository;
    session: SessionRepository;
    topic: TopicRepository;
    userInterest: UserInterestRepository;
    feed: FeedRepository;
    follow: FollowRepository;
    timeline: TimelineRepository;
    feedAsset: FeedAssetRepository;
    postTopic: PostTopicRepository;
    group: GroupRepository;
    comment: CommentRepository;
  }

  interface RepositoryConfig {
    db: AppContext["db"];
  }
}
