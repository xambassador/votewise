import type { AppContext } from "@/context";

import { Assertions, InvalidInputError } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { Controller } from "@/core/auth/forgot-password/controller";
import { requestParserPluginFactory } from "@/plugins/request-parser";

import { mockTaskQueue } from "../../__mock__/queue";
import { mockUserRepository } from "../../__mock__/repository";
import { mockCryptoService, mockJWTService, mockSessionManager, sessionManagerMockDeps } from "../../__mock__/services";
import { appUrl, buildReq, buildRes, buildUser, locals } from "../../helpers";

const user = buildUser();
const controller = new Controller({
  assert: new Assertions(),
  repositories: { user: mockUserRepository },
  services: {
    jwt: mockJWTService,
    crypto: mockCryptoService,
    session: mockSessionManager
  },
  queues: { tasksQueue: mockTaskQueue },
  config: { appUrl },
  plugins: { requestParser: requestParserPluginFactory() }
} as unknown as AppContext);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Forgot Password Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ body: {} });
    const res = buildRes({ locals });

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(InvalidInputError);
    expect(error.message).toBe("email is missing");
  });

  it("should return generic message if user not found", async () => {
    const req = buildReq({ body: { email: user.email } });
    const res = buildRes({ locals });
    mockUserRepository.findByEmail.mockResolvedValueOnce(undefined);

    await controller.handle(req, res);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(user.email);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "If the email exists, a reset link will be sent." });
  });

  it("should create a new session and queue email", async () => {
    const req = buildReq({ body: { email: user.email } });
    const res = buildRes({ locals });
    const sessionId = "session-id";

    mockUserRepository.findByEmail.mockResolvedValueOnce(user);
    sessionManagerMockDeps.mockCryptoService.generateRandomString.mockReturnValue(sessionId);

    const queueData = {
      name: "email",
      payload: {
        templateName: "forgot-password",
        to: user.email,
        subject: "Forgot Password",
        locals: {
          firstName: user.first_name,
          expiresInUnit: "minutes",
          expiresIn: 30,
          resetLink: `http://localhost:3000/auth/reset-password?token=${sessionId}`,
          email: user.email,
          logo: appUrl + "/assets/logo.png"
        }
      }
    };

    const key = `forgot-password:${sessionId}`;
    const expiresIn = 30 * Minute;
    const data = { userId: user.id, email: user.email };

    await controller.handle(req, res);

    expect(sessionManagerMockDeps.mockCache.setWithExpiry).toHaveBeenCalledWith(key, JSON.stringify(data), expiresIn);
    expect(mockTaskQueue.add).toHaveBeenCalledWith(queueData);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "If the email exists, a reset link will be sent." });
  });
});
