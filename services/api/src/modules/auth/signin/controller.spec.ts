import { Assertions } from "@votewise/lib/errors";
import { Minute } from "@votewise/lib/times";

import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockeCryptoService } from "@/services/__mock__/crypto.service";
import { mockJWTService } from "@/services/__mock__/jwt.service";
import { mockCache } from "@/storage/__mock__/redis";

import { buildReq, buildRes, buildUser } from "../../../../test/helpers";
import { Controller } from "./controller";
import { Filters } from "./filter";
import { EmailStrategy, UsernameStrategy } from "./strategies";

const mockUsernameStrategy = {
  handle: jest.fn().mockName("usernameStrategy.handle")
} as unknown as jest.Mocked<UsernameStrategy>;
const mockEmailStrategy = {
  handle: jest.fn().mockName("emailStrategy.handle")
} as unknown as jest.Mocked<EmailStrategy>;

const body = { email: "test@gmail.com", password: "password" };
const userNameBody = { username: "test", password: "password" };
const user = buildUser();
const accessToken = {
  username: user.user_name,
  user_id: user.id,
  is_email_verified: user.is_email_verify,
  email: user.email
};
const response = {
  access_token: "access_token",
  refresh_token: "refresh_token",
  expires_in: 15 * Minute,
  expires_in_unit: "ms"
};

const controller = new Controller({
  cache: mockCache,
  filters: new Filters(),
  cryptoService: mockeCryptoService,
  jwtService: mockJWTService,
  assert: new Assertions(),
  strategies: {
    email: new EmailStrategy({ userRepository: mockUserRepository }),
    username: new UsernameStrategy({ userRepository: mockUserRepository })
  }
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Signin Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ body: { password: "password" } });
    const res = buildRes();

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("email or username is required");
  });

  it("should throw error if user is not found", async () => {
    let req = buildReq({ body });
    const res = buildRes();
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findByUsername.mockResolvedValue(null);

    let error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`User with email ${body.email} not found`);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(body.email);
    expect(mockUserRepository.findByUsername).not.toHaveBeenCalled();
    mockUserRepository.findByEmail.mockClear();
    mockUserRepository.findByUsername.mockClear();

    req = buildReq({ body: userNameBody });
    error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`User with username ${userNameBody.username} not found`);
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userNameBody.username);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it("should throw error if password is invalid", async () => {
    const req = buildReq({ body });
    const res = buildRes();
    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(user);
    mockeCryptoService.comparePassword.mockResolvedValue(false);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("Invalid password");
  });

  it("should return access token and refresh token and create session", async () => {
    const req = buildReq({ body });
    const res = buildRes();
    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(user);
    mockeCryptoService.comparePassword.mockResolvedValue(true);
    mockJWTService.signAccessToken.mockReturnValue("access_token");
    mockJWTService.signRefreshToken.mockReturnValue("refresh_token");

    await controller.handle(req, res);

    expect(mockJWTService.signAccessToken).toHaveBeenCalledWith(accessToken, { expiresIn: "15m" });
    expect(mockJWTService.signRefreshToken).toHaveBeenCalledWith({ user_id: user.id }, { expiresIn: "7d" });
    expect(mockCache.setWithExpiry).toHaveBeenCalledWith(`session:${user.id}`, "refresh_token", 20 * Minute);
    expect(res.json).toHaveBeenCalledWith(response);
  });

  describe("getStrategy", () => {
    const controller = new Controller({
      cache: mockCache,
      filters: new Filters(),
      cryptoService: mockeCryptoService,
      jwtService: mockJWTService,
      assert: new Assertions(),
      strategies: { email: mockEmailStrategy, username: mockUsernameStrategy }
    });

    it("should pick correct strategy", async () => {
      const req = buildReq({ body });
      const res = buildRes();
      mockEmailStrategy.handle.mockResolvedValue(user);
      mockUsernameStrategy.handle.mockResolvedValue(user);
      mockeCryptoService.comparePassword.mockResolvedValue(true);
      mockJWTService.signAccessToken.mockReturnValue("access_token");
      mockJWTService.signRefreshToken.mockReturnValue("refresh_token");

      await controller.handle(req, res);
      expect(mockUsernameStrategy.handle).not.toHaveBeenCalled();
      expect(mockEmailStrategy.handle).toHaveBeenCalledWith(body.email);
    });
  });
});
