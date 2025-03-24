import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { requestParserPluginFactory } from "@/plugins/request-parser";
import { SessionManager } from "@/services/session.service";
import { COOKIE_KEYS } from "@/utils/constant";

import { buildReq, buildRes } from "../../../../../test/helpers";
import { UserRegisterService } from "../../register/service";
import { Controller } from "../controller";
import { EmailStrategy, UsernameStrategy } from "../strategies";
import * as helpers from "./helpers";

/* ----------------------------------------------------------------------------------------------- */

const body = { email: "test@gmail.com", password: "password" };
const userNameBody = { username: "test", password: "password" };
const ip = "192.34.24.45";
const locals = { meta: { ip } };

const sessionManager = new SessionManager({
  cache: helpers.mockCache,
  jwtService: helpers.mockJWTService,
  cryptoService: helpers.mockCryptoService,
  assert: new Assertions(),
  sessionRepository: helpers.mockSessionRepository,
  accessTokenExpiration: 30 * Minute
});
const userRegisterService = new UserRegisterService({
  tasksQueue: helpers.mockTaskQueue,
  cache: helpers.mockCache,
  cryptoService: helpers.mockCryptoService
});
const controller = new Controller({
  requestParser: requestParserPluginFactory(),
  cryptoService: helpers.mockCryptoService,
  jwtService: helpers.mockJWTService,
  assert: new Assertions(),
  sessionManager,
  strategies: {
    email: new EmailStrategy({ userRepository: helpers.mockUserRepository }),
    username: new UsernameStrategy({ userRepository: helpers.mockUserRepository })
  },
  userRepository: helpers.mockUserRepository,
  sessionRepository: helpers.mockSessionRepository,
  refreshTokenRepository: helpers.mockRefreshTokenRepository,
  factorRepository: helpers.mockFactorRepository,
  userRegisterService
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

    const { user } = helpers.setupHappyPath();
    helpers.mockCryptoService.comparePassword.mockResolvedValue(false);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCryptoService.comparePassword).toHaveBeenCalledWith(body.password, user.password);
    expect(helpers.mockJWTService.signAccessToken).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid credentials");
  });

  it("should resend OTP if email is not verified", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    const verificationCode = "verification_code";
    const { user } = helpers.setupHappyPath({ is_email_verify: false });
    helpers.mockCryptoService.generateUUID.mockReturnValue(verificationCode);
    await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockJWTService.signAccessToken).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(res.json.mock.calls[0]?.[0]).toEqual({
      error: {
        status_code: StatusCodes.UNPROCESSABLE_ENTITY,
        message: `Email ${user.email} is not verified. We have sent a verification code to your email. Please verify your email to continue.`,
        name: "UnprocessableEntityError",
        error_code: ERROR_CODES.AUTH.EMAIL_NOT_VERIFIED,
        verification_code: verificationCode,
        expires_in: 5 * Minute
      }
    });
  });

  it("should create a session and return JWT", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    const { user } = helpers.setupHappyPath();

    const accessToken = "access_token";
    const refreshToken = "refresh_token";
    const sessionId = "session_id";
    helpers.mockJWTService.signAccessToken.mockReturnValue(accessToken);
    helpers.mockCryptoService.generateUUID.mockReturnValueOnce(sessionId).mockReturnValueOnce(refreshToken);
    helpers.mockFactorRepository.findByUserId.mockResolvedValue([]);

    await controller.handle(req, res);

    expect(helpers.mockJWTService.signAccessToken).toHaveBeenCalledWith(
      {
        sub: user.id,
        role: "user",
        email: user.email,
        aal: "aal1",
        amr: [{ method: "password", timestamp: expect.any(Number) }],
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: {},
        session_id: sessionId,
        user_aal_level: "aal1"
      },
      { expiresIn: 30 * Minute }
    );
    expect(helpers.mockSessionRepository.create).toHaveBeenCalledWith({
      id: sessionId,
      aal: "aal1",
      ip,
      userAgent: "",
      userId: user.id
    });
    expect(helpers.mockRefreshTokenRepository.create).toHaveBeenCalledWith({ token: "refresh_token", userId: user.id });
    expect(helpers.mockUserRepository.update).toHaveBeenCalledWith(user.id, { last_login: expect.any(Date) });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json.mock.calls[0]?.[0]).toEqual({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: 30 * Minute,
      expires_at: expect.any(Number),
      user: {
        id: user.id,
        email: user.email,
        role: "user",
        email_confirmed_at: user.email_confirmed_at,
        email_confirmation_sent_at: user.email_confirmation_sent_at,
        last_sign_in_at: expect.any(Date),
        is_onboarded: user.is_onboarded,
        factors: [],
        user_aal_level: "aal1"
      }
    });
    expect(res.cookie.mock.calls[0]?.[0]).toBe(COOKIE_KEYS.accessToken);
    expect(res.cookie.mock.calls[0]?.[1]).toBe(accessToken);
    expect(res.cookie.mock.calls[1]?.[0]).toBe(COOKIE_KEYS.refreshToken);
    expect(res.cookie.mock.calls[1]?.[1]).toBe(refreshToken);
  });

  describe("Signin strategy", () => {
    const controller = new Controller({
      requestParser: requestParserPluginFactory(),
      cryptoService: helpers.mockCryptoService,
      jwtService: helpers.mockJWTService,
      assert: new Assertions(),
      sessionManager,
      strategies: { email: helpers.mockEmailStrategy, username: helpers.mockUsernameStrategy },
      userRepository: helpers.mockUserRepository,
      sessionRepository: helpers.mockSessionRepository,
      refreshTokenRepository: helpers.mockRefreshTokenRepository,
      factorRepository: helpers.mockFactorRepository,
      userRegisterService
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
