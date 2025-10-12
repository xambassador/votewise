import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { requestParserPluginFactory } from "@/plugins/request-parser";

import { buildReq, buildRes } from "../../../../../test/helpers";
import { Controller } from "../controller";
import * as helpers from "./helpers";

const body = helpers.body;
const locals = helpers.locals;
const controller = new Controller({
  assert: new Assertions(),
  cache: helpers.mockCache,
  requestParser: requestParserPluginFactory(),
  userRepository: helpers.mockUserRepository,
  cryptoService: helpers.mockCryptoService
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Verify Email Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ body: {} });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCache.get).not.toHaveBeenCalled();
    expect(error.message).toBe("email is missing");
  });

  it("should throw error if otp is in invalid format", async () => {
    const req = buildReq({ body: { ...body, otp: 12222 } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCache.get).not.toHaveBeenCalled();
    expect(error.message).toBe("otp must be a string");
  });

  it("should throw error if verification session not found", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockCache.get.mockResolvedValue(null);
    helpers.mockUserRepository.findByEmail.mockResolvedValue(helpers.unverifiedUser);
    const key = `email:${helpers.unverifiedUser.email}:verification`;

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCache.get).toHaveBeenCalledWith(key);
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Verification session expired. Try again.");
  });

  it("should throw error if verification code is invalid", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockCache.get.mockResolvedValue(
      JSON.stringify({ ...helpers.locals.meta, verificationCode: "invalid_code", email: helpers.unverifiedUser.email })
    );
    helpers.mockUserRepository.findByEmail.mockResolvedValue(helpers.unverifiedUser);

    const error = await controller.handle(req, res).catch((e) => e);

    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid verification code");
  });

  it("should throw error if email is invalid", async () => {
    const req = buildReq({ body: { ...body, email: "invalid_email@gmail.com" } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...helpers.locals.meta,
        verificationCode: helpers.body.verification_code,
        email: helpers.unverifiedUser.email
      })
    );

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid email");
  });

  it("should throw error if user not found by email", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findByEmail.mockResolvedValue(undefined);
    helpers.mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...helpers.locals.meta,
        verificationCode: helpers.body.verification_code,
        email: helpers.unverifiedUser.email
      })
    );

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledWith(body.email);
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe(`User with email ${helpers.body.email} not found`);
  });

  it("should throw error if otp is invalid", async () => {
    const req = buildReq({ body: { ...body, otp: "127272111" } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockCryptoService.verifyOtp.mockReturnValue(false);
    helpers.mockUserRepository.findByEmail.mockResolvedValue(helpers.unverifiedUser);
    helpers.mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...helpers.locals.meta,
        verificationCode: helpers.body.verification_code,
        email: helpers.unverifiedUser.email
      })
    );

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(helpers.mockCryptoService.verifyOtp).toHaveBeenCalledWith(helpers.unverifiedUser.secret, "127272111");
    expect(error.message).toBe("Invalid otp");
  });

  it("should return if email is already verified", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findByEmail.mockResolvedValueOnce(helpers.verifiedUser);
    helpers.mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...helpers.locals.meta,
        verificationCode: helpers.body.verification_code,
        email: helpers.verifiedUser.email
      })
    );

    await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({
      user_id: helpers.verifiedUser.id,
      email: helpers.verifiedUser.email,
      is_email_verify: true
    });
  });

  it("should verify email successfully", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockCryptoService.generateUUID.mockReturnValue("new-secret");
    helpers.mockCache.get.mockResolvedValue(
      JSON.stringify({
        ...helpers.locals.meta,
        verificationCode: helpers.body.verification_code,
        email: helpers.unverifiedUser.email
      })
    );
    const key = `email:${helpers.unverifiedUser.email}:verification`;

    await controller.handle(req, res);
    expect(helpers.mockUserRepository.update).toHaveBeenCalledWith(body.user_id, {
      is_email_verify: true,
      email_confirmed_at: expect.any(Date),
      secret: "new-secret"
    });
    expect(helpers.mockCache.del).toHaveBeenCalledWith(key);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({
      user_id: helpers.unverifiedUser.id,
      email: helpers.unverifiedUser.email,
      is_email_verify: true
    });
  });
});
