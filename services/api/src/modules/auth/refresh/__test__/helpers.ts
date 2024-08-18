import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { mockJWTService } from "@/services/__mock__/jwt.service";
import { JWTService } from "@/services/jwt.service";
import { mockCache } from "@/storage/__mock__/redis";

import { buildUser } from "../../../../../test/helpers";

export const ip = "192.168.2.45";
export const user = buildUser({ is_email_verify: true });
export const locals = { meta: { ip } };
export const jwtService = new JWTService({ accessTokenSecret: "secret", refreshTokenSecret: "secret" });
const tokenData = { user_id: user.id, session_id: "session_id", is_email_verified: true };
export const accessToken = jwtService.signAccessToken(tokenData);
export const refreshToken = jwtService.signRefreshToken({ user_id: user.id, session_id: "session_id" });

export function setupHappyPath() {
  mockUserRepository.findById.mockResolvedValue(user);
  mockCache.hget.mockResolvedValue(ip);
  mockCryptoService.generateUUID.mockReturnValue("session_id");
  mockJWTService.signAccessToken.mockReturnValue(accessToken);
  mockJWTService.signRefreshToken.mockReturnValue(refreshToken);
  return { session_id: "session_id", accessToken, refreshToken };
}

export function clearAllMocks() {
  mockUserRepository.findById.mockClear();
  mockCache.hget.mockClear();
  mockCryptoService.generateUUID.mockClear();
  mockJWTService.signAccessToken.mockClear();
  mockJWTService.signRefreshToken.mockClear();
}

export { mockCache, mockUserRepository, mockCryptoService, mockJWTService };
