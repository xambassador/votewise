import { Assertions, InvalidInputError } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { requestParserPluginFactory } from "@/plugins/request-parser";
import { mockTaskQueue } from "@/queues/__mock__";
import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { mockJWTService } from "@/services/__mock__/jwt.service";
import { mockSessionManager, sessionManagerMockDeps } from "@/services/__mock__/session.service";

import { appUrl, buildReq, buildRes, buildUser, locals } from "../../../../../test/helpers";
import { Controller } from "../controller";

const user = buildUser();
const controller = new Controller({
  userRepository: mockUserRepository,
  assert: new Assertions(),
  jwtService: mockJWTService,
  cryptoService: mockCryptoService,
  tasksQueue: mockTaskQueue,
  appUrl,
  requestParser: requestParserPluginFactory(),
  sessionManager: mockSessionManager
});

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
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);

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
