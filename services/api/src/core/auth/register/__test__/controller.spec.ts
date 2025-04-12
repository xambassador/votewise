import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { requestParserPluginFactory } from "@/plugins/request-parser";

import { buildReq, buildRes, buildUser } from "../../../../../test/helpers";
import { Controller } from "../controller";
import { UserRegisterService } from "../service";
import * as helpers from "./helpers";

const user = buildUser();
const ip = "192.168.2.45";
const locals = { meta: { ip } };
const body = {
  email: user.email,
  password: "Johndoe@123"
};
const assert = new Assertions();
const service = new UserRegisterService({
  cache: helpers.mockCache,
  cryptoService: helpers.mockCryptoService,
  tasksQueue: helpers.mockTaskQueue,
  appUrl: "http://localhost:3000"
});
const controller = new Controller({
  assert,
  cryptoService: helpers.mockCryptoService,
  userRepository: helpers.mockUserRepository,
  requestParser: requestParserPluginFactory(),
  userRegisterService: service
});

beforeEach(() => {
  jest.clearAllMocks();
  helpers.clearAllMocks();
});

describe("Register Controller", () => {
  it("should throw error if request is invalid", async () => {
    const req = buildReq({ body: { email: "test" } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid email address");
  });

  it("should throw error email already exists", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findByEmail.mockResolvedValueOnce(user);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledWith(body.email);
    expect(helpers.mockUserRepository.create).not.toHaveBeenCalled();
    expect(error.message).toBe(`${body.email} already exists`);
  });

  it("should create user and send verification email", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    const { otp, uuid: verificationCode, defaultUserName } = helpers.setupHappyPath();
    const windowExpiryIn = 5 * Minute;
    const data = JSON.stringify({ userId: user.id, ip, email: body.email, verificationCode });
    const createBody = {
      email: body.email,
      password: "hashed-password",
      user_name: "user_" + defaultUserName,
      first_name: "INVALID_FIRST_NAME",
      last_name: "INVALID_LAST_NAME"
    };
    const queueData = {
      name: "email",
      payload: {
        to: body.email,
        subject: "Verify your email",
        templateName: "signup",
        locals: {
          otp,
          logo: "http://localhost:3000/assets/logo.png",
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

    expect(helpers.mockUserRepository.create).toHaveBeenCalledWith(createBody);
    expect(helpers.mockCache.setWithExpiry).toHaveBeenCalledWith(key, data, windowExpiryIn);
    expect(helpers.mockTaskQueue.add).toHaveBeenCalledWith(queueData);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith(response);
  });
});
