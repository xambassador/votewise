import type { AppContext } from "@/context";

import { Assertions, InvalidInputError, ResourceNotFoundError } from "@votewise/errors";

import { requestParserPluginFactory } from "@/plugins/request-parser";
import { mockSessionManager, sessionManagerMockDeps } from "@/services/__mock__/session.service";

import { buildReq, buildRes } from "../../../../../test/helpers";
import { Controller } from "../controller";
import * as helpers from "./helpers";

const locals = helpers.locals;
const body = { password: helpers.password };
const user = helpers.user;

const controller = new Controller({
  plugins: { requestParser: requestParserPluginFactory() },
  services: { jwt: helpers.jwtService, crypto: helpers.mockCryptoService, session: mockSessionManager },
  assert: new Assertions(),
  repositories: { user: helpers.mockUserRepository },
  config: { appUrl: helpers.appUrl },
  queues: { tasksQueue: helpers.mockTaskQueue }
} as unknown as AppContext);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Reset Password Controller", () => {
  it("should throw error if request is invalid", async () => {
    let req = buildReq({ body: {} });
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

  it("should throw error if session is expired", async () => {
    const req = buildReq({ body, query: { token: helpers.invalidSessionId } });
    const res = buildRes({ locals });
    sessionManagerMockDeps.mockCache.get.mockResolvedValue(null);
    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).not.toHaveBeenCalled();
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(ResourceNotFoundError);
    expect(error.message).toBe("Your session has expired. Please try again");
  });

  it("should throw error if user is not found", async () => {
    const req = buildReq({ body, query: { token: helpers.invalidSessionId } });
    const res = buildRes({ locals });
    sessionManagerMockDeps.mockCache.get.mockResolvedValue(helpers.sessionData);
    helpers.mockUserRepository.findById.mockResolvedValue(undefined);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(helpers.mockUserRepository.findById).toHaveBeenCalledWith(user.id);
    expect(helpers.mockUserRepository.update).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(ResourceNotFoundError);
    expect(error.message).toBe(`User with email ${helpers.sessionDataAsJson.email} not found`);
  });

  it("should update password successfully", async () => {
    const req = buildReq({ body, query: { token: helpers.invalidSessionId } });
    const res = buildRes({ locals });
    sessionManagerMockDeps.mockCache.get.mockResolvedValue(helpers.sessionData);
    helpers.mockUserRepository.findById.mockResolvedValue(user);
    helpers.mockCryptoService.hashPassword.mockResolvedValue("hashed-password");
    helpers.mockCryptoService.generateUUID.mockReturnValue("new-secret");

    const data = {
      name: "email",
      payload: {
        templateName: "password-reset-success",
        to: user.email,
        subject: "Password changed successfully",
        locals: {
          name: user.first_name,
          loginUrl: `${helpers.appUrl}/auth/signin`,
          logo: `${helpers.appUrl}/assets/logo.png`
        }
      }
    };

    await controller.handle(req, res);
    expect(helpers.mockUserRepository.update).toHaveBeenCalledWith(user.id, {
      password: "hashed-password",
      secret: "new-secret"
    });
    expect(helpers.mockTaskQueue.add).toHaveBeenCalledWith(data);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Password updated successfully" });
  });
});
