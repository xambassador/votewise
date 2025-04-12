import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { mockSessionRepository } from "@/repository/__mock__/session.repository";
import { mockCache } from "@/storage/__mock__/redis";

import { SessionManager } from "../session.service";
import { mockCryptoService } from "./crypto.service";
import { mockJWTService } from "./jwt.service";

export const mockSessionManager = new SessionManager({
  cache: mockCache,
  sessionRepository: mockSessionRepository,
  jwtService: mockJWTService,
  cryptoService: mockCryptoService,
  assert: new Assertions(),
  accessTokenExpiration: 30 * Minute
});
export const sessionManagerMockDeps = {
  mockCache,
  mockSessionRepository,
  mockJWTService,
  mockCryptoService
};
