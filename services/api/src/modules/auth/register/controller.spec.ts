import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/lib/errors";
import { Minute } from "@votewise/lib/times";

import { mockTaskQueue } from "@/queues/__mock__";
import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockeCryptoService } from "@/services/__mock__/crypto.service";
import { mockCache } from "@/storage/__mock__/redis";

import { buildReq, buildRes, buildUser } from "../../../../test/helpers";
import { Controller } from "./controller";
import { Filters } from "./filter";

const user = buildUser();
const body = {
  email: user.email,
  password: "Johndoe@123",
  username: user.user_name,
  first_name: user.first_name,
  last_name: user.last_name
};
const createBody = {
  email: body.email,
  password: "hashed-password",
  user_name: body.username,
  first_name: body.first_name,
  last_name: body.last_name
};
const assert = new Assertions();
const controller = new Controller({
  assert,
  cache: mockCache,
  cryptoService: mockeCryptoService,
  filters: new Filters(),
  tasksQueue: mockTaskQueue,
  userRepository: mockUserRepository
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Register Controller", () => {
  it("should throw error if request is invalid", async () => {
    const req = buildReq({ body: { email: "test" } });
    const res = buildRes();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("Invalid email address");
  });

  it("should throw error if user already exists", async () => {
    const req = buildReq({ body });
    const res = buildRes();
    mockUserRepository.findByEmail.mockResolvedValueOnce(user);
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("Email already exists");
  });

  it("should throw error if username already exists", async () => {
    const req = buildReq({ body });
    const res = buildRes();
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockUserRepository.findByUsername.mockResolvedValueOnce(user);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`Username ${body.username} already exists`);
  });

  it("should throw error if IP address is invalid", async () => {
    const req = buildReq({ body, headers: { "x-forwarded-for": "" } });
    const res = buildRes();
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockUserRepository.findByUsername.mockResolvedValueOnce(null);
    mockUserRepository.create.mockResolvedValueOnce(user);
    mockeCryptoService.hashPassword.mockResolvedValueOnce("hashed-password");

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("Looks like you are behind a proxy or VPN");
  });

  it("should create user and send verification email", async () => {
    const req = buildReq({ body, headers: { "x-forwarded-for": "192.168.2.43" } });
    const res = buildRes();
    const verificationWindowToken = "some-random-token";
    const windowExpiryInMs = 5 * Minute;
    const data = JSON.stringify({ userId: user.id, otp: 123456, ip: "192.168.2.43" });

    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    mockUserRepository.findByUsername.mockResolvedValueOnce(null);
    mockUserRepository.create.mockResolvedValueOnce(user);
    mockeCryptoService.hashPassword.mockResolvedValueOnce("hashed-password");
    mockeCryptoService.generateUUID.mockReturnValue(verificationWindowToken);
    mockeCryptoService.getOtp.mockReturnValue(123456);
    mockCache.set.mockResolvedValueOnce("OK");

    await controller.handle(req, res);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(body.email);
    expect(mockUserRepository.create).toHaveBeenCalledWith(createBody);
    expect(mockCache.setWithExpiry).toHaveBeenCalledWith(verificationWindowToken, data, windowExpiryInMs);
    expect(mockTaskQueue.add).toHaveBeenCalledWith({
      name: "email",
      payload: {
        to: body.email,
        subject: "Verify your email",
        templateName: "signup",
        locals: {
          otp: 123456
        }
      }
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      user_id: user.id,
      verification_code: verificationWindowToken,
      expires_in: windowExpiryInMs,
      expires_in_unit: "ms"
    });
  });
});
