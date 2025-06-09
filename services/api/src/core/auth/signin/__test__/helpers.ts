import type { User } from "../../../../../test/helpers";
import type { EmailStrategy, UsernameStrategy } from "../strategies";

import { faker } from "@faker-js/faker";

import { mockTaskQueue } from "@/queues/__mock__";
import { mockFactorRepository } from "@/repository/__mock__/factor.repository";
import { mockRefreshTokenRepository } from "@/repository/__mock__/refresh-token.repository";
import { mockSessionRepository } from "@/repository/__mock__/session.repository";
import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { mockJWTService } from "@/services/__mock__/jwt.service";
import { mockCache } from "@/storage/__mock__/redis";

import { buildUser } from "../../../../../test/helpers";

export const mockUsernameStrategy = {
  handle: jest.fn().mockName("usernameStrategy.handle")
} as unknown as jest.Mocked<UsernameStrategy>;
export const mockEmailStrategy = {
  handle: jest.fn().mockName("emailStrategy.handle")
} as unknown as jest.Mocked<EmailStrategy>;

export function setupHappyPath(overrides?: Partial<User>) {
  const sessionId = faker.string.uuid();
  const accessToken = faker.string.alphanumeric(64);
  const refreshToken = faker.string.alphanumeric(64);
  const user = buildUser({ is_email_verify: true });
  mockUserRepository.findByEmail.mockResolvedValue({ ...user, ...overrides });
  mockUserRepository.findByUsername.mockResolvedValue({ ...user, ...overrides });
  mockEmailStrategy.handle.mockResolvedValue({ ...user, ...overrides });
  mockUsernameStrategy.handle.mockResolvedValue({ ...user, ...overrides });
  mockCryptoService.comparePassword.mockResolvedValue(true);
  mockCryptoService.generateUUID.mockReturnValue(sessionId);
  mockJWTService.signAccessToken.mockReturnValue(accessToken);
  mockCache.keys.mockResolvedValue([]);
  return { user, accessToken, sessionId, refreshToken };
}

export function clearAllMocks() {
  mockUserRepository.findByEmail.mockClear();
  mockUserRepository.findByUsername.mockClear();
  mockEmailStrategy.handle.mockClear();
  mockUsernameStrategy.handle.mockClear();
  mockCryptoService.comparePassword.mockClear();
  mockCryptoService.generateUUID.mockClear();
  mockJWTService.signAccessToken.mockClear();
  mockCache.keys.mockClear();
}

export {
  mockUserRepository,
  mockCryptoService,
  mockJWTService,
  mockCache,
  mockSessionRepository,
  mockFactorRepository,
  mockRefreshTokenRepository,
  mockTaskQueue
};
