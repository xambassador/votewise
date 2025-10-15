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
import { SearchRepository } from "./search.repository";
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
export function createRepositories(dataLayer: AppContext["dataLayer"]): Repositories {
  const userRepository = new UserRepository({ dataLayer });
  const factorRepository = new FactorRepository({ dataLayer });
  const challengeRepository = new ChallengeRepository({ dataLayer });
  const refreshTokenRepository = new RefreshTokenRepository({ dataLayer });
  const sessionRepository = new SessionRepository({ dataLayer });
  const topicRepository = new TopicRepository({ dataLayer });
  const userInterestRepository = new UserInterestRepository({ dataLayer });
  const feedRepository = new FeedRepository({ dataLayer });
  const followRepository = new FollowRepository({ dataLayer });
  const timelineRepository = new TimelineRepository({ dataLayer });
  const feedAssetRepository = new FeedAssetRepository({ dataLayer });
  const postTopicRepository = new PostTopicRepository({ dataLayer });
  const groupRepository = new GroupRepository({ dataLayer });
  const commentRepository = new CommentRepository({ dataLayer });
  const notificationRepository = new NotificationRepository({ dataLayer });
  const searchRepository = new SearchRepository({ dataLayer });
  const transactionManager = new TransactionManager({ dataLayer });
  const aggregator = new Aggregator({ dataLayer });
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
    search: searchRepository,
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
    search: SearchRepository;
  }

  interface RepositoryConfig {
    dataLayer: AppContext["dataLayer"];
  }
}
