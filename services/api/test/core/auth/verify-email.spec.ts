import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { Controller } from "@/core/auth/verify/controller";
import { requestParserPluginFactory } from "@/plugins/request-parser";

import { mockCache } from "../../__mock__/redis";
import { mockUserRepository } from "../../__mock__/repository";
import { mockCryptoService } from "../../__mock__/services";
import { buildReq, buildRes, buildUser, ip, locals } from "../../helpers";

const unverifiedUser = buildUser();
const verifiedUser = buildUser({ ...unverifiedUser, is_email_verify: true });
const body = {
  email: unverifiedUser.email,
  user_id: unverifiedUser.id,
  verification_code: faker.string.alphanumeric(8),
  otp: "123456"
};
const session = { userId: body.user_id, otp: body.otp, ip };

function setupHappyPath() {
  mockCache.get.mockResolvedValue(JSON.stringify(session));
  mockUserRepository.findById.mockResolvedValue(unverifiedUser);
  mockCryptoService.verifyOtp.mockReturnValue(true);
}

const controller = new Controller({
  assert: new Assertions(),
  cache: mockCache,
  plugins: { requestParser: requestParserPluginFactory() },
  repositories: { user: mockUserRepository },
  services: { crypto: mockCryptoService }
} as unknown as AppContext);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Verify Email Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ body: {} });
    const res = buildRes({ locals });
    setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockCache.get).not.toHaveBeenCalled();
    expect(error.message).toBe("email is missing");
  });

  it("should throw error if otp is in invalid format", async () => {
    const req = buildReq({ body: { ...body, otp: 12222 } });
    const res = buildRes({ locals });
    setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockCache.get).not.toHaveBeenCalled();
    expect(error.message).toBe("otp must be a string");
  });

  it("should throw error if verification session not found", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    setupHappyPath();
    mockCache.get.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(unverifiedUser);
    const key = `email:${unverifiedUser.email}:verification`;

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockCache.get).toHaveBeenCalledWith(key);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Verification session expired. Try again.");
  });

  it("should throw error if verification code is invalid", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    setupHappyPath();
    mockCache.get.mockResolvedValue(
      JSON.stringify({ ...locals.meta, verificationCode: "invalid_code", email: unverifiedUser.email })
    );
    mockUserRepository.findByEmail.mockResolvedValue(unverifiedUser);

    const error = await controller.handle(req, res).catch((e) => e);

    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid verification code");
  });

  it("should throw error if email is invalid", async () => {
    const req = buildReq({ body: { ...body, email: "invalid_email@gmail.com" } });
    const res = buildRes({ locals });
    setupHappyPath();
    mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...locals.meta,
        verificationCode: body.verification_code,
        email: unverifiedUser.email
      })
    );

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid email");
  });

  it("should throw error if user not found by email", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    setupHappyPath();
    mockUserRepository.findByEmail.mockResolvedValue(undefined);
    mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...locals.meta,
        verificationCode: body.verification_code,
        email: unverifiedUser.email
      })
    );

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(body.email);
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe(`User with email ${body.email} not found`);
  });

  it("should throw error if otp is invalid", async () => {
    const req = buildReq({ body: { ...body, otp: "127272111" } });
    const res = buildRes({ locals });
    setupHappyPath();
    mockCryptoService.verifyOtp.mockReturnValue(false);
    mockUserRepository.findByEmail.mockResolvedValue(unverifiedUser);
    mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...locals.meta,
        verificationCode: body.verification_code,
        email: unverifiedUser.email
      })
    );

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(mockCryptoService.verifyOtp).toHaveBeenCalledWith(unverifiedUser.secret, "127272111");
    expect(error.message).toBe("Invalid otp");
  });

  it("should return if email is already verified", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    setupHappyPath();
    mockUserRepository.findByEmail.mockResolvedValueOnce(verifiedUser);
    mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...locals.meta,
        verificationCode: body.verification_code,
        email: verifiedUser.email
      })
    );

    await controller.handle(req, res).catch((e) => e);
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({
      user_id: verifiedUser.id,
      email: verifiedUser.email,
      is_email_verify: true
    });
  });

  it("should verify email successfully", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    setupHappyPath();
    mockCryptoService.generateUUID.mockReturnValue("new-secret");
    mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...locals.meta,
        verificationCode: body.verification_code,
        email: unverifiedUser.email
      })
    );
    const key = `email:${unverifiedUser.email}:verification`;

    await controller.handle(req, res);
    expect(mockUserRepository.update).toHaveBeenCalledWith(body.user_id, {
      is_email_verify: true,
      email_confirmed_at: expect.any(Date),
      secret: "new-secret"
    });
    expect(mockCache.del).toHaveBeenCalledWith(key);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({
      user_id: unverifiedUser.id,
      email: unverifiedUser.email,
      is_email_verify: true
    });
  });
});
