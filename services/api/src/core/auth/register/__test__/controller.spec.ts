import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { requestParserPluginFactory } from "@/plugins/request-parser";

import { buildReq, buildRes, buildUser } from "../../../../../test/helpers";
import { Controller } from "../controller";
import * as helpers from "./helpers";

const user = buildUser();
const ip = "192.168.2.45";
const locals = { meta: { ip } };
const body = {
  email: user.email,
  password: "Johndoe@123",
  username: user.user_name,
  first_name: user.first_name,
  last_name: user.last_name
};
const assert = new Assertions();
const controller = new Controller({
  assert,
  cache: helpers.mockCache,
  cryptoService: helpers.mockCryptoService,
  tasksQueue: helpers.mockTaskQueue,
  userRepository: helpers.mockUserRepository,
  requestParser: requestParserPluginFactory()
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
    expect(helpers.mockUserRepository.findByUsername).not.toHaveBeenCalled();
    expect(helpers.mockUserRepository.create).not.toHaveBeenCalled();
    expect(error.message).toBe(`${body.email} already exists`);
  });

  it("should throw error if username already exists", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findByUsername.mockResolvedValue(user);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByUsername).toHaveBeenCalledWith(body.username);
    expect(helpers.mockUserRepository.create).not.toHaveBeenCalled();
    expect(error.message).toBe(`Username ${body.username} already exists`);
  });

  it("should create user and send verification email", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    const { otp, uuid: verificationCode } = helpers.setupHappyPath();
    const windowExpiryInMs = 5 * Minute;
    const data = JSON.stringify({ userId: user.id, ip });
    const createBody = {
      email: body.email,
      password: "hashed-password",
      user_name: body.username,
      first_name: body.first_name,
      last_name: body.last_name
    };
    const queueData = {
      name: "email",
      payload: {
        to: body.email,
        subject: "Verify your email",
        templateName: "signup",
        locals: {
          otp
        }
      }
    };
    const response = {
      user_id: user.id,
      verification_code: verificationCode,
      expires_in: windowExpiryInMs,
      expires_in_unit: "ms"
    };

    await controller.handle(req, res);

    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledWith(body.email);
    expect(helpers.mockUserRepository.create).toHaveBeenCalledWith(createBody);
    expect(helpers.mockCache.setWithExpiry).toHaveBeenCalledWith(verificationCode, data, windowExpiryInMs);
    expect(helpers.mockTaskQueue.add).toHaveBeenCalledWith(queueData);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith(response);
  });
});
