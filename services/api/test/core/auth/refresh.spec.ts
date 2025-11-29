import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { Controller } from "@/core/auth/refresh/controller";
import { requestParserPluginFactory } from "@/plugins/request-parser";
import { JWTService } from "@/services/jwt.service";

import { mockCache } from "../../__mock__/redis";
import { mockRefreshTokenRepository, mockSessionRepository, mockUserRepository } from "../../__mock__/repository";
import { mockCryptoService, mockJWTService, mockSessionManager } from "../../__mock__/services";
import { buildRefreshToken, buildReq, buildRes, buildUser, ip, locals } from "../../helpers";

const sessionId = faker.string.uuid();
const secret = faker.string.alphanumeric(32);
const user = buildUser({ is_email_verify: true });
const jwtService = new JWTService({ accessTokenSecret: secret });
const amr = [{ method: "password", timestamp: Date.now() }];
const appMetaData = { provider: "email", providers: ["email"] };
const accessToken = jwtService.signAccessToken({
  aal: "aal1",
  amr,
  email: user.email,
  role: "user",
  session_id: sessionId,
  sub: user.id,
  user_metadata: {},
  app_metadata: appMetaData,
  user_aal_level: "aal1",
  is_onboarded: false
});
const refreshToken = faker.string.alphanumeric(64);

function setupHappyPath() {
  const refreshToken = buildRefreshToken({ user_id: user.id });
  mockUserRepository.findById.mockResolvedValue(user);
  mockCache.hget.mockResolvedValue(ip);
  mockCryptoService.generateUUID.mockReturnValue(sessionId);
  mockJWTService.signAccessToken.mockReturnValue(accessToken);
  mockRefreshTokenRepository.find.mockResolvedValue(refreshToken);
  return { session_id: sessionId, accessToken, refreshToken };
}

function clearAllMocks() {
  mockUserRepository.findById.mockClear();
  mockCache.hget.mockClear();
  mockCryptoService.generateUUID.mockClear();
  mockJWTService.signAccessToken.mockClear();
  mockRefreshTokenRepository.find.mockClear();
}

const assert = new Assertions();

const controller = new Controller({
  repositories: { user: mockUserRepository, refreshToken: mockRefreshTokenRepository },
  services: { session: mockSessionManager, jwt: jwtService },
  assert,
  plugins: { requestParser: requestParserPluginFactory() }
} as unknown as AppContext);

beforeEach(() => {
  jest.clearAllMocks();
  clearAllMocks();
});

describe("Refresh Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ body: {} });
    const res = buildRes({ locals });
    setupHappyPath();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
    expect(error.message).toBe("access_token is missing");
  });

  it("should throw error if access token is invalid", async () => {
    const req = buildReq({ body: { access_token: "invalid_access_token", refresh_token: refreshToken } });
    const res = buildRes({ locals });
    setupHappyPath();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findById).not.toHaveBeenCalledWith();
    expect(error.message).toBe("Invalid access token");
  });

  it("should throw error if refresh token is invalid", async () => {
    const req = buildReq({ body: { access_token: accessToken, refresh_token: "invalid_refresh_token" } });
    const res = buildRes({ locals });
    setupHappyPath();
    mockRefreshTokenRepository.find.mockResolvedValue(undefined);
    let error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findById).not.toHaveBeenCalledWith();
    expect(error.message).toBe("Invalid refresh token");

    mockRefreshTokenRepository.find.mockResolvedValue(buildRefreshToken({ revoked: true }));
    error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findById).not.toHaveBeenCalledWith();
    expect(error.message).toBe("Invalid refresh token");
  });

  it("should throw error if user not found", async () => {
    const req = buildReq({ body: { access_token: accessToken, refresh_token: refreshToken } });
    const res = buildRes({ locals });
    setupHappyPath();
    mockUserRepository.findById.mockResolvedValueOnce(undefined);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe(`User not found`);
  });

  it("should refresh session", async () => {
    const req = buildReq({ body: { access_token: accessToken, refresh_token: refreshToken } });
    const res = buildRes({ locals });
    const { session_id } = setupHappyPath();
    const key = `session:${session_id}`;
    const newSessionId = faker.string.uuid();
    const newRefreshToken = faker.string.alphanumeric(64);
    const newAccessToken = faker.string.alphanumeric(64);
    const { refreshToken: generateRefreshToken } = setupHappyPath();
    mockCryptoService.generateUUID.mockReturnValueOnce(newSessionId).mockReturnValue(newRefreshToken);
    mockJWTService.signAccessToken.mockReturnValueOnce(newAccessToken);

    await controller.handle(req, res);

    expect(mockCache.del).toHaveBeenCalledWith(key);
    expect(mockSessionRepository.delete).toHaveBeenCalledWith(session_id);
    expect(mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(generateRefreshToken.id);
    expect(mockJWTService.signAccessToken).toHaveBeenCalledWith(
      {
        sub: user.id,
        role: "user",
        email: user.email,
        aal: "aal1",
        amr,
        app_metadata: appMetaData,
        user_metadata: {},
        session_id: newSessionId,
        user_aal_level: "aal1",
        is_onboarded: false
      },
      { expiresIn: 30 * Minute }
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });
});
