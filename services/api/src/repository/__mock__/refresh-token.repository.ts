import type { RefreshTokenRepository } from "../refresh-token.repository";

export const mockRefreshTokenRepository = {
  create: jest.fn().mockName("refreshTokenRepository.create"),
  revoke: jest.fn().mockName("refreshTokenRepository.revoke"),
  find: jest.fn().mockName("refreshTokenRepository.find")
} as unknown as jest.Mocked<RefreshTokenRepository>;
