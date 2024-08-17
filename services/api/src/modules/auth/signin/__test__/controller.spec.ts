import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/lib/errors";
import { Minute } from "@votewise/lib/times";

import { SessionManager } from "@/services/session.service";

import { buildReq, buildRes } from "../../../../../test/helpers";
import { Controller } from "../controller";
import { Filters } from "../filter";
import { EmailStrategy, UsernameStrategy } from "../strategies";
import * as helpers from "./helpers";

const body = { email: "test@gmail.com", password: "password" };
const userNameBody = { username: "test", password: "password" };
const ip = "192.34.24.45";
const locals = { meta: { ip } };
const user = helpers.user;

const sessionManager = new SessionManager({
  cache: helpers.mockCache,
  jwtService: helpers.mockJWTService,
  cryptoService: helpers.mockCryptoService,
  assert: new Assertions()
});
const controller = new Controller({
  filters: new Filters(),
  cryptoService: helpers.mockCryptoService,
  jwtService: helpers.mockJWTService,
  assert: new Assertions(),
  sessionManager,
  strategies: {
    email: new EmailStrategy({ userRepository: helpers.mockUserRepository }),
    username: new UsernameStrategy({ userRepository: helpers.mockUserRepository })
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  helpers.clearAllMocks();
});

describe("Signin Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ body: { password: "password" } });
    const res = buildRes({ locals });

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error.message).toBe("email or username is required");
  });

  it("should throw error if user is not found", async () => {
    let req = buildReq({ body });
    const res = buildRes({ locals });

    helpers.setupHappyPath();
    helpers.mockUserRepository.findByEmail.mockResolvedValue(null);
    helpers.mockUserRepository.findByUsername.mockResolvedValue(null);

    let error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCryptoService.comparePassword).not.toHaveBeenCalled();
    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledWith(body.email);
    expect(helpers.mockUserRepository.findByUsername).not.toHaveBeenCalled();
    expect(error.message).toBe(`User with email ${body.email} not found`);

    helpers.mockUserRepository.findByEmail.mockClear();
    helpers.mockUserRepository.findByUsername.mockClear();

    req = buildReq({ body: userNameBody });
    error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCryptoService.comparePassword).not.toHaveBeenCalled();
    expect(helpers.mockUserRepository.findByUsername).toHaveBeenCalledWith(userNameBody.username);
    expect(helpers.mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error.message).toBe(`User with username ${userNameBody.username} not found`);
  });

  it("should throw error if password is invalid", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });

    helpers.setupHappyPath();
    helpers.mockCryptoService.comparePassword.mockResolvedValue(false);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCryptoService.comparePassword).toHaveBeenCalledWith(body.password, user.password);
    expect(helpers.mockJWTService.signAccessToken).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid password");
  });

  it("should throw error if user has more then 3 active sessions", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });

    helpers.setupHappyPath();
    helpers.mockCache.keys.mockResolvedValue(["session:1:1", "session:1:2", "session:1:3"]);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCache.keys).toHaveBeenCalledWith(`session:${user.id}:*`);
    expect(helpers.mockJWTService.signAccessToken).not.toHaveBeenCalled();
    expect(error.message).toBe("You have 3 active sessions, please logout from one of them");
  });

  it("should return access token, refresh token and create session", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    const key = `session:${user.id}:session_id`;
    const session = { ip, user_agent: req.headers["user-agent"] };
    const accessToken = { user_id: user.id, is_email_verified: user.is_email_verify, session_id: "session_id" };

    await controller.handle(req, res);

    expect(helpers.mockJWTService.signAccessToken).toHaveBeenCalledWith(accessToken, { expiresIn: "15m" });
    expect(helpers.mockJWTService.signRefreshToken).toHaveBeenCalledWith({ user_id: user.id }, { expiresIn: "7d" });
    expect(helpers.mockCache.hset).toHaveBeenCalledWith(key, session);
    expect(helpers.mockCache.expire).toHaveBeenCalledWith(key, 20 * Minute);
    expect(res.json).toHaveBeenCalledWith({
      access_token: "access_token",
      refresh_token: "refresh_token",
      expires_in: 15 * Minute,
      expires_in_unit: "ms"
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  describe("Signin strategy", () => {
    const controller = new Controller({
      filters: new Filters(),
      cryptoService: helpers.mockCryptoService,
      jwtService: helpers.mockJWTService,
      assert: new Assertions(),
      sessionManager,
      strategies: { email: helpers.mockEmailStrategy, username: helpers.mockUsernameStrategy }
    });

    it("should pick correct strategy", async () => {
      const req = buildReq({ body });
      const res = buildRes({ locals });
      helpers.setupHappyPath();

      await controller.handle(req, res);
      expect(helpers.mockUsernameStrategy.handle).not.toHaveBeenCalled();
      expect(helpers.mockEmailStrategy.handle).toHaveBeenCalledWith(body.email);
    });
  });
});
