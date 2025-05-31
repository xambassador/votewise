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
