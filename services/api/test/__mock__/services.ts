import type { BucketService } from "@/services/bucket.service";
import type { CryptoService } from "@/services/crypto.service";
import type { JWTService } from "@/services/jwt.service";
import type { OnboardService } from "@/services/onboard.service";

import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { SessionManager } from "@/services/session.service";

import { mockCache } from "./redis";
import { mockSessionRepository } from "./repository";

export const mockBucketService = {
  getUrlForType: jest.fn().mockImplementation((url: string, type: "avatar" | "background") => {
    if (type === "avatar") {
      return `https://example.com/avatar/${url}`;
    }
    return `https://example.com/background/${url}`;
  })
} as unknown as jest.Mocked<BucketService>;

export const mockCryptoService = {
  symmetricEncrypt: jest.fn().mockName("cryptoService.symmetricEncrypt"),
  symmetricDecrypt: jest.fn().mockName("cryptoService.symmetricDecrypt"),
  generateUUID: jest.fn().mockName("cryptoService.generateUUID").mockReturnValue("random-uuid"),
  generateHex: jest.fn().mockName("cryptoService.generateHex").mockReturnValue("random-hex"),
  generateApiKey: jest.fn().mockName("cryptoService.generateApiKey").mockReturnValue("random-api-key"),
  hashPassword: jest.fn().mockName("cryptoService.hashPassword"),
  getOtp: jest.fn().mockName("cryptoService.getOtp"),
  comparePassword: jest.fn().mockName("cryptoService.comparePassword"),
  hash: jest.fn().mockName("cryptoService.hash"),
  verifyOtp: jest.fn().mockName("cryptoService.verifyOtp"),
  generate2FAQRCode: jest.fn().mockName("cryptoService.generate2FAQRCode"),
  verify2FAToken: jest.fn().mockName("cryptoService.verify2FAToken"),
  generate2FASecret: jest.fn().mockName("cryptoService.generate2FASecret").mockReturnValue("random-2fa-secret"),
  generateKeyUri: jest.fn().mockName("cryptoService.generateKeyUri"),
  verify2FACode: jest.fn().mockName("cryptoService.verify2FACode"),
  generateNanoId: jest.fn().mockName("cryptoService.generateNanoId"),
  generateRandomString: jest.fn().mockName("cryptoService.generateRandomString")
} as jest.Mocked<CryptoService>;

export const mockJWTService = {
  signAccessToken: jest.fn().mockName("jwtService.signAccessToken"),
  verifyAccessToken: jest.fn().mockName("jwtService.verifyAccessToken"),
  handleError: jest.fn().mockName("jwtService.handleError"),
  decodeAccessToken: jest.fn().mockName("jwtService.decodeAccessToken"),
  signRid: jest.fn().mockName("jwtService.signRid"),
  verifyRid: jest.fn().mockName("jwtService.verifyRid")
} as unknown as jest.Mocked<JWTService>;

export const mockOnboardService = {
  getOnboardDataFromCache: jest.fn().mockName("getOnboardDataFromCache"),
  clearUserOnboardCache: jest.fn().mockName("clearUserOnboardCache"),
  getOnboardKey: jest.fn().mockName("getOnboardKey"),
  getUserOnboardData: jest.fn().mockName("getUserOnboardData"),
  updateUserOnboardCache: jest.fn().mockName("updateUserOnboardCache")
} as unknown as jest.Mocked<OnboardService>;

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

export const mockSessionManagerWithoutCtx = {
  clearUserSessions: jest.fn().mockName("sessionManager.clearUserSessions"),
  create: jest.fn().mockName("sessionManager.create"),
  createForgotPasswordSession: jest.fn().mockName("sessionManager.createForgotPasswordSession"),
  delete: jest.fn().mockName("sessionManager.delete"),
  deleteForgotPasswordSession: jest.fn().mockName("sessionManager.deleteForgotPasswordSession"),
  get: jest.fn().mockName("sessionManager.get"),
  getForgotPasswordSession: jest.fn().mockName("sessionManager.getForgotPasswordSession"),
  getOnboardStatus: jest.fn().mockName("sessionManager.getOnboardStatus"),
  getSessionKey: jest.fn().mockName("sessionManager.getSessionKey"),
  save: jest.fn().mockName("sessionManager.save"),
  saveOnboardStatus: jest.fn().mockName("sessionManager.saveOnboardStatus"),
  saveSessionToCache: jest.fn().mockName("sessionManager.saveSessionToCache"),
  update: jest.fn().mockName("sessionManager.update"),
  updateOnboardStatus: jest.fn().mockName("sessionManager.updateOnboardStatus")
} as unknown as jest.Mocked<SessionManager>;
