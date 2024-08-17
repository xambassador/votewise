import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/lib/errors";

import { buildReq, buildRes } from "../../../../../test/helpers";
import { Controller } from "../controller";
import { Filters } from "../filter";
import * as helpers from "./helpers";

const body = helpers.body;
const locals = helpers.locals;
const controller = new Controller({
  assert: new Assertions(),
  cache: helpers.mockCache,
  filters: new Filters(),
  userRepository: helpers.mockUserRepository
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

  it("should throw error if verification code is invalid", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockCache.get.mockResolvedValue(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCache.get).toHaveBeenCalledWith(body.verification_code);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalled();
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid verification_code");
  });

  it("should throw error if accessing session from different ip", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals: { ...locals, meta: { ip: "some-different-ip" } } });
    helpers.setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalled();
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid request");
  });

  it("should throw error if user id is invalid", async () => {
    const req = buildReq({ body: { ...body, user_id: "invalid_user_id" } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalled();
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid user_id");
  });

  it("should throw error if otp is invalid", async () => {
    const req = buildReq({ body: { ...body, otp: 127272111 } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalled();
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid otp");
  });

  it("should throw error if user not found by it's user_id", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findById.mockResolvedValue(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).toHaveBeenCalledWith(body.user_id);
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe(`User with id ${helpers.body.user_id} not found`);
  });

  it("should throw error if email is invalid", async () => {
    const req = buildReq({ body: { ...body, email: "invalid_email@gmail.com" } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid email");
  });

  it("should throw error if email is already verified", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findById.mockResolvedValueOnce(helpers.verifiedUser);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockCache.del).not.toHaveBeenCalled();
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(error.message).toBe("Email is already verified");
  });

  it("should verify email successfully", async () => {
    const req = buildReq({ body });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    await controller.handle(req, res);
    expect(helpers.mockUserRepository.update).toHaveBeenCalledWith(body.user_id, { is_email_verify: true });
    expect(helpers.mockCache.del).toHaveBeenCalledWith(body.verification_code);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({
      user_id: helpers.unverifiedUser.id,
      email: helpers.unverifiedUser.email,
      is_email_verify: true
    });
  });
});
