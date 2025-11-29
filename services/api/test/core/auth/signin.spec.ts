import type { AppContext } from "@/context";
import type { ControllerOptions } from "@/core/auth/signin/controller";
import type { User } from "../../helpers";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { COOKIE_KEYS, ERROR_CODES } from "@votewise/constant";
import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { UserRegisterService } from "@/core/auth/register/service";
import { Controller } from "@/core/auth/signin/controller";
import { EmailStrategy, UsernameStrategy } from "@/core/auth/signin/strategies";
import { requestParserPluginFactory } from "@/plugins/request-parser";

import { mockTaskQueue } from "../../__mock__/queue";
import { mockCache } from "../../__mock__/redis";
import {
  mockFactorRepository,
  mockRefreshTokenRepository,
  mockSessionRepository,
  mockUserRepository
} from "../../__mock__/repository";
import { mockCryptoService, mockJWTService, mockSessionManager } from "../../__mock__/services";
import { appUrl, buildReq, buildRes, buildUser, ip, locals } from "../../helpers";

/* ----------------------------------------------------------------------------------------------- */

const body = { email: faker.internet.email(), password: "password" };
const userNameBody = { username: faker.internet.userName(), password: "password" };
const mockUsernameStrategy = {
  handle: jest.fn().mockName("usernameStrategy.handle")
} as unknown as jest.Mocked<UsernameStrategy>;
const mockEmailStrategy = {
  handle: jest.fn().mockName("emailStrategy.handle")
} as unknown as jest.Mocked<EmailStrategy>;

function setupHappyPath(overrides?: Partial<User>) {
  const sessionId = faker.string.uuid();
  const accessToken = faker.string.alphanumeric(64);
  const refreshToken = faker.string.alphanumeric(64);
  const user = buildUser({ is_email_verify: true });
  mockUserRepository.findByEmail.mockResolvedValue({ ...user, ...overrides });
  mockUserRepository.findByUsername.mockResolvedValue({ ...user, ...overrides });
  mockEmailStrategy.handle.mockResolvedValue({ ...user, ...overrides });
  mockUsernameStrategy.handle.mockResolvedValue({ ...user, ...overrides });
  mockCryptoService.comparePassword.mockResolvedValue(true);
  mockCryptoService.generateUUID.mockReturnValue(sessionId);
  mockJWTService.signAccessToken.mockReturnValue(accessToken);
  mockCache.keys.mockResolvedValue([]);
  return { user, accessToken, sessionId, refreshToken };
}

function clearAllMocks() {
  mockUserRepository.findByEmail.mockClear();
  mockUserRepository.findByUsername.mockClear();
  mockEmailStrategy.handle.mockClear();
  mockUsernameStrategy.handle.mockClear();
  mockCryptoService.comparePassword.mockClear();
  mockCryptoService.generateUUID.mockClear();
  mockJWTService.signAccessToken.mockClear();
  mockCache.keys.mockClear();
}

const userRegisterService = new UserRegisterService({
  services: { crypto: mockCryptoService },
  queues: { tasksQueue: mockTaskQueue },
  config: { appUrl },
  cache: mockCache
} as unknown as AppContext);
const controller = new Controller({
  plugins: { requestParser: requestParserPluginFactory() },
  services: { crypto: mockCryptoService, jwt: mockJWTService, session: mockSessionManager },
  assert: new Assertions(),
  strategies: {
    email: new EmailStrategy({ repositories: { user: mockUserRepository } } as unknown as AppContext),
    username: new UsernameStrategy({ repositories: { user: mockUserRepository } } as unknown as AppContext)
  },
  repositories: {
    user: mockUserRepository,
    session: mockSessionRepository,
    refreshToken: mockRefreshTokenRepository,
    factor: mockFactorRepository
  },
  userRegisterService
} as unknown as ControllerOptions);

beforeEach(() => {
  jest.clearAllMocks();
  clearAllMocks();
});

describe("Signin Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ body: { password: "password" } });
    const res = buildRes({ locals });

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error.message).toBe("email or username is required");
  });

  it("should throw error if user is not found", async () => {
    let req = buildReq({ body });
    const res = buildRes({ locals });

    setupHappyPath();
    mockUserRepository.findByEmail.mockResolvedValue(undefined);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    let error = await controller.handle(req, res).catch((e) => e);
    expect(mockCryptoService.hashPassword).toHaveBeenCalledWith(body.password);
    expect(mockCryptoService.comparePassword).not.toHaveBeenCalled();
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(body.email);
    expect(mockUserRepository.findByUsername).not.toHaveBeenCalled();
    expect(error.message).toBe(`User with email ${body.email} not found`);

    mockUserRepository.findByEmail.mockClear();
    mockUserRepository.findByUsername.mockClear();
    mockCryptoService.hashPassword.mockClear();

    req = buildReq({ body: userNameBody });
    error = await controller.handle(req, res).catch((e) => e);
    expect(mockCryptoService.hashPassword).toHaveBeenCalledWith(body.password);
    expect(mockCryptoService.comparePassword).not.toHaveBeenCalled();
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userNameBody.username);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error.message).toBe(`User with username ${userNameBody.username} not found`);
  });

  it("should throw error if password is invalid", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });

    const { user } = setupHappyPath();
    mockCryptoService.comparePassword.mockResolvedValue(false);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockCryptoService.comparePassword).toHaveBeenCalledWith(body.password, user.password);
    expect(mockJWTService.signAccessToken).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid credentials");
  });

  it("should resend OTP if email is not verified", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    const verificationCode = "verification_code";
    const { user } = setupHappyPath({ is_email_verify: false });
    mockCryptoService.generateUUID.mockReturnValue(verificationCode);
    await controller.handle(req, res).catch((e) => e);
    expect(mockJWTService.signAccessToken).not.toHaveBeenCalled();
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
    const { user, accessToken, sessionId, refreshToken } = setupHappyPath();

    mockCryptoService.generateUUID.mockReturnValueOnce(sessionId).mockReturnValueOnce(refreshToken);
    mockFactorRepository.findByUserId.mockResolvedValue([]);

    await controller.handle(req, res);

    expect(mockJWTService.signAccessToken).toHaveBeenCalledWith(
      {
        sub: user.id,
        role: "user",
        email: user.email,
        aal: "aal1",
        amr: [{ method: "password", timestamp: expect.any(Number) }],
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: {},
        session_id: sessionId,
        user_aal_level: "aal1",
        is_onboarded: user.is_onboarded
      },
      { expiresIn: 30 * Minute }
    );
    expect(mockSessionRepository.create).toHaveBeenCalledWith({
      id: sessionId,
      aal: "aal1",
      ip,
      userAgent: "",
      userId: user.id
    });
    expect(mockRefreshTokenRepository.create).toHaveBeenCalledWith({ token: refreshToken, userId: user.id });
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, { last_login: expect.any(Date) });
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
      plugins: { requestParser: requestParserPluginFactory() },
      services: { crypto: mockCryptoService, jwt: mockJWTService, session: mockSessionManager },
      assert: new Assertions(),
      strategies: { email: mockEmailStrategy, username: mockUsernameStrategy },
      repositories: {
        user: mockUserRepository,
        session: mockSessionRepository,
        refreshToken: mockRefreshTokenRepository,
        factor: mockFactorRepository
      },
      userRegisterService
    } as unknown as ControllerOptions);

    it("should pick correct strategy", async () => {
      const req = buildReq({ body });
      const res = buildRes({ locals });
      setupHappyPath();

      await controller.handle(req, res);
      expect(mockUsernameStrategy.handle).not.toHaveBeenCalled();
      expect(mockEmailStrategy.handle).toHaveBeenCalledWith(body.email);
    });
  });
});
