import { faker } from "@faker-js/faker";

import { mockRefreshTokenRepository } from "@/repository/__mock__/refresh-token.repository";
import { mockSessionRepository } from "@/repository/__mock__/session.repository";
import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { mockJWTService } from "@/services/__mock__/jwt.service";
import { JWTService } from "@/services/jwt.service";
import { mockCache } from "@/storage/__mock__/redis";

import { buildRefreshToken, buildUser, ip, locals } from "../../../../../test/helpers";

export { locals };
const sessionId = faker.string.uuid();
const secret = faker.string.alphanumeric(32);
export const user = buildUser({ is_email_verify: true });
export const jwtService = new JWTService({ accessTokenSecret: secret });
export const amr = [{ method: "password", timestamp: Date.now() }];
export const appMetaData = { provider: "email", providers: ["email"] };
export const accessToken = jwtService.signAccessToken({
  aal: "aal1",
  amr,
  email: user.email,
  role: "user",
  session_id: sessionId,
  sub: user.id,
  user_metadata: {},
  app_metadata: appMetaData,
  user_aal_level: "aal1"
});
export const refreshToken = faker.string.alphanumeric(64);

export function setupHappyPath() {
  const refreshToken = buildRefreshToken({ user_id: user.id });
  mockUserRepository.findById.mockResolvedValue(user);
  mockCache.hget.mockResolvedValue(ip);
  mockCryptoService.generateUUID.mockReturnValue(sessionId);
  mockJWTService.signAccessToken.mockReturnValue(accessToken);
  mockRefreshTokenRepository.find.mockResolvedValue(refreshToken);
  return { session_id: sessionId, accessToken, refreshToken };
}

export function clearAllMocks() {
  mockUserRepository.findById.mockClear();
  mockCache.hget.mockClear();
  mockCryptoService.generateUUID.mockClear();
  mockJWTService.signAccessToken.mockClear();
  mockRefreshTokenRepository.find.mockClear();
}

export {
  mockCache,
  mockUserRepository,
  mockRefreshTokenRepository,
  mockCryptoService,
  mockJWTService,
  mockSessionRepository
};
