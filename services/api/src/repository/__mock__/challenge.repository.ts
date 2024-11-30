import type { ChallengeRepository } from "../challenge.repository";

export const mockChallengeRepository = {
  create: jest.fn().mockName("challengeRepository.create"),
  verifyChallenge: jest.fn().mockName("challengeRepository.verifyChallenge"),
  findById: jest.fn().mockName("challengeRepository.findById")
} as unknown as jest.Mocked<ChallengeRepository>;
