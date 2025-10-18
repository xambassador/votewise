import type { AppContext } from "@/context";
import type { ControllerOptions } from "@/core/auth/register/controller";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { Controller } from "@/core/auth/register/controller";
import { UserRegisterService } from "@/core/auth/register/service";
import { requestParserPluginFactory } from "@/plugins/request-parser";

import { mockTaskQueue } from "../../__mock__/queue";
import { mockCache } from "../../__mock__/redis";
import { mockUserRepository } from "../../__mock__/repository";
import { mockCryptoService } from "../../__mock__/services";
import { appUrl, buildReq, buildRes, buildUser, ip, locals } from "../../helpers";

const user = buildUser();
const body = { email: user.email, password: "Johndoe@123" };
const assert = new Assertions();

function setupHappyPath() {
  const hashedPassword = faker.string.alphanumeric(32);
  const otp = faker.string.numeric(6);
  const uuid = faker.string.uuid();
  mockUserRepository.findByEmail.mockResolvedValue(undefined);
  mockUserRepository.findByUsername.mockResolvedValue(undefined);
  mockUserRepository.create.mockResolvedValue(user);
  mockCryptoService.hashPassword.mockResolvedValue(hashedPassword);
  mockCryptoService.getOtp.mockReturnValue(otp);
  mockCryptoService.generateUUID.mockReturnValue(uuid);
  mockCryptoService.generateNanoId.mockReturnValue("some-random-username");
  return {
    hashedPassword,
    otp,
    uuid: uuid.replace(/-/g, ""),
    defaultUserName: "some-random-username"
  };
}

function clearAllMocks() {
  mockUserRepository.findByEmail.mockClear();
  mockUserRepository.findByUsername.mockClear();
  mockUserRepository.create.mockClear();
  mockCryptoService.hashPassword.mockClear();
  mockCryptoService.getOtp.mockClear();
  mockCryptoService.generateUUID.mockClear();
}

const service = new UserRegisterService({
  cache: mockCache,
  services: { crypto: mockCryptoService },
  queues: { tasksQueue: mockTaskQueue },
  config: { appUrl }
} as unknown as AppContext);
const controller = new Controller({
  assert,
  services: { crypto: mockCryptoService },
  repositories: { user: mockUserRepository },
  plugins: { requestParser: requestParserPluginFactory() },
  userRegisterService: service
} as unknown as ControllerOptions);

beforeEach(() => {
  jest.clearAllMocks();
  clearAllMocks();
});

describe("Register Controller", () => {
  it("should throw error if request is invalid", async () => {
    const req = buildReq({ body: { email: "test" } });
    const res = buildRes({ locals });
    setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid email address");
  });

  it("should throw error email already exists", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    setupHappyPath();
    mockUserRepository.findByEmail.mockResolvedValueOnce(user);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(body.email);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(error.message).toBe(`${body.email} already exists`);
  });

  it("should create user and send verification email", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    const { otp, uuid: verificationCode, defaultUserName, hashedPassword } = setupHappyPath();
    const windowExpiryIn = 5 * Minute;
    const data = JSON.stringify({ userId: user.id, ip, email: body.email, verificationCode });
    const createBody = {
      email: body.email,
      password: hashedPassword,
      user_name: defaultUserName,
      first_name: "INVALID_FIRST_NAME",
      last_name: "INVALID_LAST_NAME",
      is_email_verify: false,
      is_onboarded: false,
      vote_bucket: 10,
      secret: expect.any(String)
    };
    const queueData = {
      name: "email",
      payload: {
        to: body.email,
        subject: "Verify your email",
        templateName: "signup",
        locals: {
          otp,
          logo: `${appUrl}/assets/logo.png`,
          expiresIn: windowExpiryIn / Minute,
          expiresInUnit: "minutes"
        }
      }
    };
    const response = {
      user_id: user.id,
      verification_code: verificationCode,
      expires_in: windowExpiryIn
    };
    const key = `email:${user.email}:verification`;

    await controller.handle(req, res);

    expect(mockUserRepository.create).toHaveBeenCalledWith(createBody);
    expect(mockCache.setWithExpiry).toHaveBeenCalledWith(key, data, windowExpiryIn);
    expect(mockTaskQueue.add).toHaveBeenCalledWith(queueData);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith(response);
  });
});
