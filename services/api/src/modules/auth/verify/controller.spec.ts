import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/lib/errors";

import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCache } from "@/storage/__mock__/redis";

import { buildReq, buildRes, buildUser } from "../../../../test/helpers";
import { Controller } from "./controller";
import { Filters } from "./filter";

const unverifiedUser = buildUser();
const verifiedUser = buildUser({ ...unverifiedUser, is_email_verify: true });

const body = {
  email: unverifiedUser.email,
  user_id: unverifiedUser.id,
  verification_code: "verification_code",
  otp: 123456
};

const session = { userId: body.user_id, otp: body.otp };

const controller = new Controller({
  assert: new Assertions(),
  cache: mockCache,
  filters: new Filters(),
  userRepository: mockUserRepository
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Verify Email Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ body: {} });
    const res = buildRes();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("email is missing");
  });

  it("should throw error if verification code is invalid", async () => {
    const req = buildReq({ body });
    const res = buildRes();
    mockCache.get.mockResolvedValue(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("Invalid verification_code");
    expect(mockCache.get).toHaveBeenCalledWith(body.verification_code);
  });

  it("should throw error if user id is invalid", async () => {
    const req = buildReq({ body: { ...body, user_id: "invalid_user_id" } });
    const res = buildRes();
    mockCache.get.mockResolvedValueOnce(JSON.stringify(session));

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("Invalid user_id");
  });

  it("should throw error if otp is invalid", async () => {
    const req = buildReq({ body: { ...body, otp: 127272111 } });
    const res = buildRes();
    mockCache.get.mockResolvedValueOnce(JSON.stringify(session));

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("Invalid otp");
  });

  it("should throw error if user not found by it's user_id", async () => {
    const req = buildReq({ body });
    const res = buildRes();
    mockCache.get.mockResolvedValueOnce(JSON.stringify(session));
    mockUserRepository.findById.mockResolvedValueOnce(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`User with id ${body.user_id} not found`);
  });

  it("should throw error if email is invalid", async () => {
    const req = buildReq({ body: { ...body, email: "invalid_email@gmail.com" } });
    const res = buildRes();
    mockCache.get.mockResolvedValueOnce(JSON.stringify(session));
    mockUserRepository.findById.mockResolvedValueOnce(unverifiedUser);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(body.user_id);
    expect(error.message).toBe("Invalid email");
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it("should throw error if email is already verified", async () => {
    const req = buildReq({ body });
    const res = buildRes();
    mockCache.get.mockResolvedValueOnce(JSON.stringify(session));
    mockUserRepository.findById.mockResolvedValueOnce(verifiedUser);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("Email is already verified");
    expect(mockCache.del).not.toHaveBeenCalled();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it("should verify email successfully", async () => {
    const req = buildReq({ body });
    const res = buildRes();
    mockCache.get.mockResolvedValueOnce(JSON.stringify(session));
    mockUserRepository.findById.mockResolvedValueOnce(unverifiedUser);

    await controller.handle(req, res);
    expect(mockUserRepository.update).toHaveBeenCalledWith(body.user_id, { is_email_verify: true });
    expect(mockCache.del).toHaveBeenCalledWith(body.verification_code);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });
});
