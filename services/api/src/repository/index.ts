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

/**
 * Factory function to create a container of repositories.
 *
 * @param db Database instance from AppContext
 * @returns {Repositories} Repositories container
 */
export function createRepositories(db: AppContext["db"]): Repositories {
  const userRepository = new UserRepository({ db });
  const factorRepository = new FactorRepository({ db });
  const challengeRepository = new ChallengeRepository({ db });
  const refreshTokenRepository = new RefreshTokenRepository({ db });
  const sessionRepository = new SessionRepository({ db });
  const topicRepository = new TopicRepository({ db });
  const userInterestRepository = new UserInterestRepository({ db });
  const feedRepository = new FeedRepository({ db });
  const followRepository = new FollowRepository({ db });
  const timelineRepository = new TimelineRepository({ db });
  const feedAssetRepository = new FeedAssetRepository({ db });
  const postTopicRepository = new PostTopicRepository({ db });
  const groupRepository = new GroupRepository({ db });
  const commentRepository = new CommentRepository({ db });
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
    comment: commentRepository
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
  }

  interface RepositoryConfig {
    db: AppContext["db"];
  }
}
