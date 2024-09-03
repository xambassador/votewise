import { Assertions, InvalidInputError, ResourceNotFoundError } from "@votewise/lib/errors";

import { requestParserPluginFactory } from "@/plugins/request-parser";
import { mockTaskQueue } from "@/queues/__mock__";
import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { mockJWTService } from "@/services/__mock__/jwt.service";

import { buildReq, buildRes, buildUser } from "../../../../../test/helpers";
import { Controller } from "../controller";

const user = buildUser();
const ip = "192.168.4.45";
const locals = { meta: { ip } };
const controller = new Controller({
  userRepository: mockUserRepository,
  assert: new Assertions(),
  jwtService: mockJWTService,
  cryptoService: mockCryptoService,
  tasksQueue: mockTaskQueue,
  appUrl: "http://localhost:3000",
  requestParser: requestParserPluginFactory()
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

  it("should throw error if user not found", async () => {
    const req = buildReq({ body: { email: user.email } });
    const res = buildRes({ locals });
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(user.email);
    expect(error).toBeInstanceOf(ResourceNotFoundError);
    expect(error.message).toBe(`User with email ${user.email} not found`);
  });

  it("should create rid token and send email", async () => {
    const req = buildReq({ body: { email: user.email } });
    const res = buildRes({ locals });

    const ridToken = "rid_token";
    const verificationCode = "verification_code";
    const queueData = {
      name: "email",
      payload: {
        templateName: "forgot-password",
        to: user.email,
        subject: "Forgot Password",
        locals: {
          token: ridToken,
          firstName: user.first_name,
          expiresInUnit: "minutes",
          expiresIn: 5,
          clientUrl: "http://localhost:3000",
          ip: locals.meta.ip,
          email: user.email
        }
      }
    };
    const data = { email: user.email, verification_code: verificationCode };
    const key = user.secret;

    mockUserRepository.findByEmail.mockResolvedValueOnce(user);
    mockJWTService.signRid.mockReturnValue(ridToken);
    mockCryptoService.hash.mockReturnValue(verificationCode);

    await controller.handle(req, res);

    expect(mockCryptoService.hash).toHaveBeenCalledWith(`${user.id}:${ip}`);
    expect(mockJWTService.signRid).toHaveBeenCalledWith(data, key, { expiresIn: "5m" });
    expect(mockTaskQueue.add).toHaveBeenCalledWith(queueData);
  });
});
