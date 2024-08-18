import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/lib/errors";
import { Minute } from "@votewise/lib/times";

import { JWTService } from "@/services/jwt.service";
import { SessionManager } from "@/services/session.service";

import { buildReq, buildRes } from "../../../../../test/helpers";
import { Controller } from "../controller";
import { Filters } from "../filter";
import * as helpers from "./helpers";

const jwtService = new JWTService({ accessTokenSecret: "secret", refreshTokenSecret: "secret" });

const assert = new Assertions();
const sessionManager = new SessionManager({
  jwtService: helpers.mockJWTService,
  cryptoService: helpers.mockCryptoService,
  cache: helpers.mockCache,
  assert
});
const controller = new Controller({
  useRepository: helpers.mockUserRepository,
  sessionManager,
  filters: new Filters({ jwtService }),
  assert
});

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
    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalledWith();
    expect(error.message).toBe("Invalid refresh token");
  });

  it("should throw error if session ip is different", async () => {
    const req = buildReq({ body: { access_token: helpers.accessToken, refresh_token: helpers.refreshToken } });
    const res = buildRes({ locals: { ...helpers.locals, meta: { ip: "some-different-ip" } } });
    helpers.setupHappyPath();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid request");
  });

  it("should throw error if old tokens are used after refresh", async () => {
    const req = buildReq({ body: { access_token: helpers.accessToken, refresh_token: helpers.refreshToken } });
    const res = buildRes({ locals: helpers.locals });
    helpers.setupHappyPath();
    helpers.mockCache.hget.mockResolvedValue(null);
    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid credentials");
  });

  it("should throw error if user not found", async () => {
    const req = buildReq({ body: { access_token: helpers.accessToken, refresh_token: helpers.refreshToken } });
    const res = buildRes({ locals: helpers.locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findById.mockResolvedValueOnce(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).toHaveBeenCalledWith(helpers.user.id);
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe(`User with id ${helpers.user.id} not found`);
  });

  it("should refresh session", async () => {
    const req = buildReq({ body: { access_token: helpers.accessToken, refresh_token: helpers.refreshToken } });
    const res = buildRes({ locals: helpers.locals });
    const { session_id } = helpers.setupHappyPath();
    const key = `session:${helpers.user.id}:${session_id}`;

    await controller.handle(req, res);
    expect(helpers.mockCache.del).toHaveBeenCalledWith(`session:${helpers.user.id}:${session_id}`);
    expect(helpers.mockJWTService.signAccessToken).toHaveBeenCalledWith(
      {
        user_id: helpers.user.id,
        is_email_verified: helpers.user.is_email_verify,
        session_id
      },
      { expiresIn: "15m" }
    );
    expect(helpers.mockJWTService.signRefreshToken).toHaveBeenCalledWith(
      { user_id: helpers.user.id, session_id },
      { expiresIn: "7d" }
    );
    expect(helpers.mockCache.hset).toHaveBeenCalledWith(key, {
      ip: helpers.ip,
      user_agent: undefined
    });
    expect(helpers.mockCache.expire).toHaveBeenCalledWith(key, 20 * Minute);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({
      access_token: helpers.accessToken,
      refresh_token: helpers.refreshToken,
      expires_in: 15 * Minute,
      expires_in_unit: "ms"
    });
  });
});
