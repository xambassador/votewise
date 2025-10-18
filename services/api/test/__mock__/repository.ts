import type { ChallengeRepository } from "@/repository/challenge.repository";
import type { FactorRepository } from "@/repository/factor.repository";
import type { PostTopicRepository } from "@/repository/post-topic.repository";
import type { RefreshTokenRepository } from "@/repository/refresh-token.repository";
import type { SessionRepository } from "@/repository/session.repository";
import type { TimelineRepository } from "@/repository/timeline.repository";
import type { UserInterestRepository } from "@/repository/user-interest.repository";
import type { UserRepository } from "@/repository/user.repository";

export const mockChallengeRepository = {
  create: jest.fn().mockName("challengeRepository.create"),
  verifyChallenge: jest.fn().mockName("challengeRepository.verifyChallenge"),
  findById: jest.fn().mockName("challengeRepository.findById")
} as unknown as jest.Mocked<ChallengeRepository>;

export const mockFactorRepository = {
  create: jest.fn().mockName("factorRepository.create"),
  verifyFactor: jest.fn().mockName("factorRepository.verifyFactor"),
  findByUserIdAndType: jest.fn().mockName("factorRepository.findByUserIdAndType"),
  findByUserId: jest.fn().mockName("factorRepository.findByUserId").mockResolvedValue([]),
  findById: jest.fn().mockName("factorRepository.findById")
} as unknown as jest.Mocked<FactorRepository>;

export const mockPostTopicRepository = {
  create: jest.fn().mockName("create"),
  createMany: jest.fn().mockName("createMany"),
  getInterestedFeedIds: jest.fn().mockName("getInterestedFeedIds")
} as unknown as jest.Mocked<PostTopicRepository>;

export const mockRefreshTokenRepository = {
  create: jest.fn().mockName("refreshTokenRepository.create"),
  revoke: jest.fn().mockName("refreshTokenRepository.revoke"),
  find: jest.fn().mockName("refreshTokenRepository.find")
} as unknown as jest.Mocked<RefreshTokenRepository>;

export const mockSessionRepository = {
  create: jest.fn().mockName("sessionRepository.create"),
  delete: jest.fn().mockName("sessionRepository.delete"),
  findByToken: jest.fn().mockName("sessionRepository.findByToken"),
  update: jest.fn().mockName("sessionRepository.update"),
  find: jest.fn().mockName("sessionRepository.find"),
  findByUserId: jest.fn().mockName("sessionRepository.findByUserId").mockResolvedValue([]),
  clearByUserId: jest.fn().mockName("sessionRepository.clearByUserId")
} as unknown as jest.Mocked<SessionRepository>;

export const mockTimelineRepository = {
  countByUserId: jest.fn().mockName("countByUserId"),
  createMany: jest.fn().mockName("createMany"),
  findByUserId: jest.fn().mockName("findByUserId")
} as unknown as jest.Mocked<TimelineRepository>;

export const mockUserInterestRepository = {
  create: jest.fn().mockName("create"),
  delete: jest.fn().mockName("delete"),
  findByUserId: jest.fn().mockName("findByUserId")
} as unknown as jest.Mocked<UserInterestRepository>;

export const mockUserRepository = {
  create: jest.fn().mockName("userRepository.create"),
  find: jest.fn().mockName("userRepository.find"),
  findOne: jest.fn().mockName("userRepository.findOne"),
  findById: jest.fn().mockName("userRepository.findById"),
  findByEmail: jest.fn().mockName("userRepository.findByEmail"),
  update: jest.fn().mockName("userRepository.update"),
  delete: jest.fn().mockName("userRepository.delete"),
  findByUsername: jest.fn().mockName("userRepository.findByUsername"),
  findManyByIds: jest.fn().mockName("userRepository.findManyByIds")
} as unknown as jest.Mocked<UserRepository>;
