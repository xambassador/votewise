import type { AppContext } from "@/context";

import { Aggregator } from "./aggregator.repository";
import { ChallengeRepository } from "./challenge.repository";
import { CommentRepository } from "./comment.repository";
import { FactorRepository } from "./factor.repository";
import { FeedAssetRepository } from "./feed-asset.repository";
import { FeedRepository } from "./feed.repository";
import { FollowRepository } from "./follow.repository";
import { GroupRepository } from "./group.repository";
import { NotificationRepository } from "./notification.repository";
import { PostTopicRepository } from "./post-topic.repository";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { SessionRepository } from "./session.repository";
import { TimelineRepository } from "./timeline.repository";
import { TopicRepository } from "./topic.repository";
import { TransactionManager } from "./transaction";
import { UserInterestRepository } from "./user-interest.repository";
import { UserRepository } from "./user.repository";

/**
 * Factory function to create a container of repositories.
 *
 * @param db Database instance from AppContext
 * @returns {Repositories} Repositories container
 */
export function createRepositories(db: AppContext["db"], dataLayer: AppContext["dataLayer"]): Repositories {
  const userRepository = new UserRepository({ db, dataLayer });
  const factorRepository = new FactorRepository({ db, dataLayer });
  const challengeRepository = new ChallengeRepository({ db, dataLayer });
  const refreshTokenRepository = new RefreshTokenRepository({ db, dataLayer });
  const sessionRepository = new SessionRepository({ db, dataLayer });
  const topicRepository = new TopicRepository({ db, dataLayer });
  const userInterestRepository = new UserInterestRepository({ db, dataLayer });
  const feedRepository = new FeedRepository({ db, dataLayer });
  const followRepository = new FollowRepository({ db, dataLayer });
  const timelineRepository = new TimelineRepository({ db, dataLayer });
  const feedAssetRepository = new FeedAssetRepository({ db, dataLayer });
  const postTopicRepository = new PostTopicRepository({ db, dataLayer });
  const groupRepository = new GroupRepository({ db, dataLayer });
  const commentRepository = new CommentRepository({ db, dataLayer });
  const notificationRepository = new NotificationRepository({ db, dataLayer });
  const transactionManager = new TransactionManager({ db, dataLayer });
  const aggregator = new Aggregator({ db, dataLayer });
  return {
    user: userRepository,
    factor: factorRepository,
    challenge: challengeRepository,
    refreshToken: refreshTokenRepository,
    session: sessionRepository,
    topic: topicRepository,
    userInterest: userInterestRepository,
    feed: feedRepository,
    follow: followRepository,
    timeline: timelineRepository,
    feedAsset: feedAssetRepository,
    postTopic: postTopicRepository,
    group: groupRepository,
    comment: commentRepository,
    notification: notificationRepository,
    transactionManager,
    aggregator
  };
}

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
    notification: NotificationRepository;
    transactionManager: TransactionManager;
    aggregator: Aggregator;
  }

  interface RepositoryConfig {
    db: AppContext["db"];
    dataLayer: AppContext["dataLayer"];
  }
}
