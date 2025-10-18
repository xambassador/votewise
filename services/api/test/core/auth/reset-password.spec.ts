import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";

import { Assertions, InvalidInputError, ResourceNotFoundError } from "@votewise/errors";

import { Controller } from "@/core/auth/reset-password/controller";
import { requestParserPluginFactory } from "@/plugins/request-parser";
import { JWTService } from "@/services/jwt.service";

import { mockTaskQueue } from "../../__mock__/queue";
import { mockUserRepository } from "../../__mock__/repository";
import { mockCryptoService, mockSessionManager, sessionManagerMockDeps } from "../../__mock__/services";
import { appUrl, buildReq, buildRes, buildUser, locals } from "../../helpers";

const user = buildUser();
const password = faker.internet.password();
const jwtService = new JWTService({ accessTokenSecret: faker.string.alphanumeric(32) });
const invalidSessionId = "invalid-session-id";
const sessionData = JSON.stringify({ userId: user.id, email: user.email });
const sessionDataAsJson = { userId: user.id, email: user.email };
const body = { password };

const controller = new Controller({
  plugins: { requestParser: requestParserPluginFactory() },
  services: { jwt: jwtService, crypto: mockCryptoService, session: mockSessionManager },
  assert: new Assertions(),
  repositories: { user: mockUserRepository },
  config: { appUrl },
  queues: { tasksQueue: mockTaskQueue }
} as unknown as AppContext);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Reset Password Controller", () => {
  it("should throw error if request is invalid", async () => {
    let req = buildReq({ body: {} });
    const res = buildRes({ locals });

    let error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(InvalidInputError);
    expect(error.message).toBe("password is missing");

    req = buildReq({ body });
    error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(InvalidInputError);
    expect(error.message).toBe("token is missing");
  });

  it("should throw error if session is expired", async () => {
    const req = buildReq({ body, query: { token: invalidSessionId } });
    const res = buildRes({ locals });
    sessionManagerMockDeps.mockCache.get.mockResolvedValue(null);
    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(ResourceNotFoundError);
    expect(error.message).toBe("Your session has expired. Please try again");
  });

  it("should throw error if user is not found", async () => {
    const req = buildReq({ body, query: { token: invalidSessionId } });
    const res = buildRes({ locals });
    sessionManagerMockDeps.mockCache.get.mockResolvedValue(sessionData);
    mockUserRepository.findById.mockResolvedValue(undefined);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(ResourceNotFoundError);
    expect(error.message).toBe(`User with email ${sessionDataAsJson.email} not found`);
  });

  it("should update password successfully", async () => {
    const req = buildReq({ body, query: { token: invalidSessionId } });
    const res = buildRes({ locals });
    sessionManagerMockDeps.mockCache.get.mockResolvedValue(sessionData);
    mockUserRepository.findById.mockResolvedValue(user);
    mockCryptoService.hashPassword.mockResolvedValue("hashed-password");
    mockCryptoService.generateUUID.mockReturnValue("new-secret");

    const data = {
      name: "email",
      payload: {
        templateName: "password-reset-success",
        to: user.email,
        subject: "Password changed successfully",
        locals: {
          name: user.first_name,
          loginUrl: `${appUrl}/auth/signin`,
          logo: `${appUrl}/assets/logo.png`
        }
      }
    };

    await controller.handle(req, res);
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, {
      password: "hashed-password",
      secret: "new-secret"
    });
    expect(mockTaskQueue.add).toHaveBeenCalledWith(data);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Password updated successfully" });
  });
});
