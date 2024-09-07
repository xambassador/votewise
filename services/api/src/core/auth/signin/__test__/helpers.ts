import type { EmailStrategy, UsernameStrategy } from "../strategies";

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

export const user = buildUser();

export function setupHappyPath() {
  mockUserRepository.findByEmail.mockResolvedValue(user);
  mockUserRepository.findByUsername.mockResolvedValue(user);
  mockEmailStrategy.handle.mockResolvedValue(user);
  mockUsernameStrategy.handle.mockResolvedValue(user);
  mockCryptoService.comparePassword.mockResolvedValue(true);
  mockCryptoService.generateUUID.mockReturnValue("session_id");
  mockJWTService.signAccessToken.mockReturnValue("access_token");
  mockJWTService.signRefreshToken.mockReturnValue("refresh_token");
  mockCache.keys.mockResolvedValue([]);
}

export function clearAllMocks() {
  mockUserRepository.findByEmail.mockClear();
  mockUserRepository.findByUsername.mockClear();
  mockEmailStrategy.handle.mockClear();
  mockUsernameStrategy.handle.mockClear();
  mockCryptoService.comparePassword.mockClear();
  mockCryptoService.generateUUID.mockClear();
  mockJWTService.signAccessToken.mockClear();
  mockJWTService.signRefreshToken.mockClear();
  mockCache.keys.mockClear();
}

export { mockUserRepository, mockCryptoService, mockJWTService, mockCache };
