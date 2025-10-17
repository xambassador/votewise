import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { requestParserPluginFactory } from "@/plugins/request-parser";
import { mockSessionManager } from "@/services/__mock__/session.service";
import { JWTService } from "@/services/jwt.service";

import { buildRefreshToken, buildReq, buildRes } from "../../../../../test/helpers";
import { Controller } from "../controller";
import * as helpers from "./helpers";

const jwtService = new JWTService({ accessTokenSecret: "secret" });

const assert = new Assertions();

const controller = new Controller({
  repositories: { user: helpers.mockUserRepository, refreshToken: helpers.mockRefreshTokenRepository },
  services: { session: mockSessionManager, jwt: jwtService },
  assert,
  plugins: { requestParser: requestParserPluginFactory() }
} as unknown as AppContext);

beforeEach(() => {
  jest.clearAllMocks();
  helpers.clearAllMocks();
});

describe("Refresh Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ body: {} });
    const res = buildRes({ locals: helpers.locals });
    helpers.setupHappyPath();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalled();
    expect(error.message).toBe("access_token is missing");
  });

  it("should throw error if access token is invalid", async () => {
    const req = buildReq({ body: { access_token: "invalid_access_token", refresh_token: helpers.refreshToken } });
    const res = buildRes({ locals: helpers.locals });
    helpers.setupHappyPath();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalledWith();
    expect(error.message).toBe("Invalid access token");
  });

  it("should throw error if refresh token is invalid", async () => {
    const req = buildReq({ body: { access_token: helpers.accessToken, refresh_token: "invalid_refresh_token" } });
    const res = buildRes({ locals: helpers.locals });
    helpers.setupHappyPath();
    helpers.mockRefreshTokenRepository.find.mockResolvedValue(undefined);
    let error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalledWith();
    expect(error.message).toBe("Invalid refresh token");

    helpers.mockRefreshTokenRepository.find.mockResolvedValue(buildRefreshToken({ revoked: true }));
    error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalledWith();
    expect(error.message).toBe("Invalid refresh token");
  });

  it("should throw error if user not found", async () => {
    const req = buildReq({ body: { access_token: helpers.accessToken, refresh_token: helpers.refreshToken } });
    const res = buildRes({ locals: helpers.locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findById.mockResolvedValueOnce(undefined);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).toHaveBeenCalledWith(helpers.user.id);
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe(`User not found`);
  });

  it("should refresh session", async () => {
    const req = buildReq({ body: { access_token: helpers.accessToken, refresh_token: helpers.refreshToken } });
    const res = buildRes({ locals: helpers.locals });
    const { session_id } = helpers.setupHappyPath();
    const key = `session:${session_id}`;
    const newSessionId = faker.string.uuid();
    const newRefreshToken = faker.string.alphanumeric(64);
    const newAccessToken = faker.string.alphanumeric(64);
    const { refreshToken } = helpers.setupHappyPath();
    helpers.mockCryptoService.generateUUID.mockReturnValueOnce(newSessionId).mockReturnValue(newRefreshToken);
    helpers.mockJWTService.signAccessToken.mockReturnValueOnce(newAccessToken);

    await controller.handle(req, res);

    expect(helpers.mockCache.del).toHaveBeenCalledWith(key);
    expect(helpers.mockSessionRepository.delete).toHaveBeenCalledWith(session_id);
    expect(helpers.mockRefreshTokenRepository.revoke).toHaveBeenCalledWith(refreshToken.id);
    expect(helpers.mockJWTService.signAccessToken).toHaveBeenCalledWith(
      {
        sub: helpers.user.id,
        role: "user",
        email: helpers.user.email,
        aal: "aal1",
        amr: helpers.amr,
        app_metadata: helpers.appMetaData,
        user_metadata: {},
        session_id: newSessionId,
        user_aal_level: "aal1"
      },
      { expiresIn: 30 * Minute }
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });
});
