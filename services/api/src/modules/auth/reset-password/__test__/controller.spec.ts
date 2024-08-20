import { StatusCodes } from "http-status-codes";

import { Assertions, BadRequestError, InvalidInputError, ResourceNotFoundError } from "@votewise/lib/errors";

import { buildReq, buildRes } from "../../../../../test/helpers";
import { Controller } from "../controller";
import { Filters } from "../filter";
import * as helpers from "./helpers";

const locals = helpers.locals;
const body = { password: helpers.password, email: helpers.user.email };
const user = helpers.user;

const controller = new Controller({
  filters: new Filters(),
  jwtService: helpers.jwtService,
  assert: new Assertions(),
  userRepository: helpers.mockUserRepository,
  cryptoService: helpers.cryptoService
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Reset Password Controller", () => {
  it("should throw error if request is invalid", async () => {
    let req = buildReq({ body: { email: helpers.user.email } });
    const res = buildRes({ locals });

    let error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(InvalidInputError);
    expect(error.message).toBe("password is missing");

    req = buildReq({ body });
    error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(InvalidInputError);
    expect(error.message).toBe("token is missing");
  });

  it("should throw error if email is invalid", async () => {
    const req = buildReq({ body, query: { token: helpers.rid } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findByEmail.mockResolvedValue(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledWith(user.email);
    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(ResourceNotFoundError);
    expect(error.message).toBe(`User with email ${user.email} not found`);
  });

  it("should throw error if token is invalid", async () => {
    const req = buildReq({ body, query: { token: "invalid-token" } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledWith(user.email);
    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe("Invalid token");
  });

  it("should throw error if emails do not match", async () => {
    const req = buildReq({ body: { ...body, email: helpers.invalidUser.email }, query: { token: helpers.rid } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();
    helpers.mockUserRepository.findByEmail.mockResolvedValue(helpers.invalidUser);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledWith(helpers.invalidUser.email);
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe("Invalid email");
  });

  it("should throw error if user is not found", async () => {
    const req = buildReq({ body, query: { token: helpers.rid } });
    const res = buildRes({ locals });
    helpers.mockUserRepository.findByEmail.mockResolvedValue(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findByEmail).toHaveBeenCalledWith(user.email);
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(ResourceNotFoundError);
    expect(error.message).toBe(`User with email ${user.email} not found`);
  });

  it("should throw error if verification code is invalid", async () => {
    const req = buildReq({ body, query: { token: helpers.invalidRid } });
    const res = buildRes({ locals });
    helpers.mockUserRepository.findByEmail.mockResolvedValue(user);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe("Invalid verification code");
  });

  it("should update user password", async () => {
    const req = buildReq({ body, query: { token: helpers.rid } });
    const res = buildRes({ locals });
    helpers.setupHappyPath();

    await controller.handle(req, res);

    expect(helpers.mockUserRepository.update).toHaveBeenCalledWith(user.id, {
      password: expect.any(String),
      secret: expect.any(String)
    });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalled();
  });
});
